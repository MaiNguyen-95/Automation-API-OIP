import axios from "axios";
import { jwtDecode } from "jwt-decode";
import fs from "node:fs";
import path from "node:path";
import { config, ServiceName, CountryServiceName, getCountryServiceConfig } from "../../support/config";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Structure of token data stored in file
 */
type TokenEntry = {
    token: string; // JWT token string
    expiresAt: number; // Expiration timestamp (Unix seconds)
    serviceName: ServiceName; // OAuth service name
    createdAt: number; // Creation timestamp (Unix seconds)
};

// ============================================================================
// CONFIGURATION
// ============================================================================

// Directory to store token files
const TOKEN_DIR = path.resolve(process.cwd(), "src/api/auth/saveAuth/tokens");

// Create token directory if it doesn't exist
if (!fs.existsSync(TOKEN_DIR)) {
    fs.mkdirSync(TOKEN_DIR, { recursive: true });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get file path for a service token
 */
function getTokenFilePath(serviceName: ServiceName): string {
    const safe = String(serviceName || "default")
        .trim()
        .replace(/[^a-zA-Z0-9._-]+/g, "_");
    return path.join(TOKEN_DIR, `${safe}.json`);
}

/**
 * Load token from file
 * @returns TokenEntry if file exists and is valid, null if file doesn't exist or invalid
 */
function loadTokenFromFile(serviceName: ServiceName): TokenEntry | null {
    const filePath = getTokenFilePath(serviceName);

    // Check if file exists first (avoid error when reading non-existent file)
    if (!fs.existsSync(filePath)) {
        return null;
    }

    // File exists → try to read and parse
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as TokenEntry;
    } catch (error) {
        // File exists but invalid/corrupted → return null (will trigger token fetch)
        console.warn(`⚠️ Failed to parse token file for service '${serviceName}':`, error);
        return null;
    }
}

/**
 * Save token to file
 */
function saveTokenToFile(serviceName: ServiceName, entry: TokenEntry): void {
    const filePath = getTokenFilePath(serviceName);
    try {
        fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), "utf-8");
        console.log(`✅ Token saved for service: ${serviceName}`);
    } catch (error) {
        console.error(`❌ Failed to save token for service '${serviceName}':`, error);
    }
}

/**
 * Check if token is still valid (not expired)
 * Token is considered invalid if it will expire in the next 60 seconds
 */
function isTokenValid(entry: TokenEntry | null): boolean {
    if (!entry) return false;
    const now = Math.floor(Date.now() / 1000);
    return entry.expiresAt > now + 60;
}

/**
 * Fetch new token from API and save to file
 */
async function fetchTokenForService(serviceName: ServiceName): Promise<string> {
    console.log(`🔐 Fetching new token for service: ${serviceName}`);

    const svc = config.services[serviceName];
    if (!svc) {
        throw new Error(`Unknown serviceName '${serviceName}'. Check config.service.`);
    }

    const tokenUrl = (svc as any).tokenUrl || config.url.token;
    if (!tokenUrl) {
        throw new Error(`Missing token URL for service '${serviceName}'. Set config.service.${serviceName}.url or config.url.token.`);
    }

    if (!svc.clientId) {
        throw new Error(`Missing clientId for service '${serviceName}'.`);
    }

    const clientSecret = (svc as any).clientSecret;
    if (!clientSecret) {
        throw new Error(`Missing clientSecret for service '${serviceName}'.`);
    }

    // Prepare OAuth2 password grant request
    const form = new URLSearchParams();
    form.append("client_id", svc.clientId);
    form.append("client_secret", svc.clientSecret);
    form.append("scope", svc.scope);
    form.append("grant_type", "client_credentials");

    // Request token from API
    const res = await axios.post(tokenUrl, form, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
    });

    // Extract token and expiration time
    const token: string = res.data.access_token;
    const decoded = jwtDecode<{ exp?: number }>(token);
    const exp = typeof decoded?.exp === "number" ? decoded.exp : Math.floor(Date.now() / 1000) + 3600; // Default 1 hour if no exp

    // Create token entry
    const entry: TokenEntry = {
        token,
        expiresAt: exp,
        serviceName,
        createdAt: Math.floor(Date.now() / 1000),
    };

    // Save to file for future use
    saveTokenToFile(serviceName, entry);
    return token;
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get valid token for a role
 *
 * Flow:
 * 1. Check if token file exists
 * 2. If not exists → fetch new token and save to file
 * 3. If exists → check if token is still valid
 * 4. If not valid → fetch new token and save to file
 * 5. If valid → use existing token
 */
export async function getTokenForService(serviceName: ServiceName): Promise<string> {
    // Try to load token from file
    const tokenEntry = loadTokenFromFile(serviceName);

    // File doesn't exist → fetch new token
    if (!tokenEntry) {
        console.log(`📁 Token file not found for service: ${serviceName}. Fetching new token...`);
        return await fetchTokenForService(serviceName);
    }

    // Token is still valid → use it
    if (isTokenValid(tokenEntry)) {
        console.log(`✅ Using valid token for service: ${serviceName} (from file)`);
        return tokenEntry.token;
    }

    // Token expired → fetch new token
    console.log(`⏰ Token expired for service: ${serviceName}. Fetching new token...`);
    return await fetchTokenForService(serviceName);
}

/**
 * Get authorization header based on token status
 *
 * @param status - 'valid_token' | 'invalid_token' | 'no_token' (case insensitive)
 * @param role - Role to get token for (required when status is 'valid_token')
 * @returns Authorization header object
 *
 * Examples:
 * - getToken('valid_token', 'admin') → { Authorization: 'Bearer <token>' }
 * - getToken('invalid_token') → { Authorization: 'Bearer invalid_token' }
 * - getToken('no_token') → {}
 */
export async function getToken(statusOrService: string, serviceName?: ServiceName): Promise<Record<string, string>> {
    const raw = String(statusOrService ?? "")
        .toLowerCase()
        .trim();
    const normalizedStatus =
        raw === "valid_token" || raw === "valid" || raw === "token" ? "valid_token" : raw === "invalid_token" || raw === "invalid" ? "invalid_token" : raw === "no_token" || raw === "notoken" || raw === "no" ? "no_token" : undefined;

    // If caller passed a serviceName as first arg, default to "valid_token"
    if (!normalizedStatus) {
        const svc = String(statusOrService || "").trim() as ServiceName;
        const token = await getTokenForService(svc);
        return { Authorization: `Bearer ${token}` };
    }

    // Case 1: no_token → don't add anything to header
    if (normalizedStatus === "no_token") {
        return {};
    }

    // Case 2: invalid_token → add "Bearer invalid_token" to header
    if (normalizedStatus === "invalid_token") {
        return { Authorization: "Bearer invalid_token" };
    }

    // Case 3: valid_token → get valid token for role and add to header
    if (normalizedStatus === "valid_token") {
        const svc = (String(serviceName || "datasource").trim() || "datasource") as ServiceName;
        const token = await getTokenForService(svc);
        return { Authorization: `Bearer ${token}` };
    }

    // Invalid status
    throw new Error(`Invalid auth status: ${statusOrService}. Must be one of: valid_token, invalid_token, no_token or a service name`);
}

/**
 * Get authorization header for country-based services
 * Priority: env token → OTP auto-login
 */
export async function getCountryToken(status: string, service: CountryServiceName, country: string): Promise<Record<string, string>> {
    const normalized = String(status ?? "").toLowerCase().trim();

    if (normalized === "no_token" || normalized === "no") return {};
    if (normalized === "invalid_token" || normalized === "invalid") return { Authorization: "Bearer invalid_token" };

    // Try env token first
    const svcConfig = getCountryServiceConfig(service, country);
    if (svcConfig.token) {
        return { Authorization: `Bearer ${svcConfig.token}` };
    }

    // Fallback: auto-login via OTP
    const { loginViaOtp } = await import("./otpLoginManager");
    const token = await loginViaOtp(country);
    return { Authorization: `Bearer ${token}` };
}

/**
 * Clear token file for a role (useful for testing token refresh)
 */
export function clearTokenForService(serviceName: ServiceName): void {
    const filePath = getTokenFilePath(serviceName);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Token cleared for service: ${serviceName}`);
    }
}
