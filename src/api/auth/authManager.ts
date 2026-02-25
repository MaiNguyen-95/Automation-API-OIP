import axios from "axios";
import { jwtDecode } from "jwt-decode";
import fs from "node:fs";
import path from "node:path";
import { config } from "../../support/config";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Structure of token data stored in file
 */
type TokenEntry = {
    token: string; // JWT token string
    expiresAt: number; // Expiration timestamp (Unix seconds)
    createdAt: number; // Creation timestamp (Unix seconds)
};

// ============================================================================
// AUTH TYPES
// ============================================================================

export type AuthStatus = "valid_token" | "invalid_token" | "no_token";

// ============================================================================
// CONFIGURATION
// ============================================================================

// Directory to store token files
const TOKEN_DIR = path.resolve(process.cwd(), "src/api/auth/saveAuth/tokens");

// Single token file (no role)
const TOKEN_FILE = path.join(TOKEN_DIR, "token.json");

// Create token directory if it doesn't exist
if (!fs.existsSync(TOKEN_DIR)) {
    fs.mkdirSync(TOKEN_DIR, { recursive: true });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get file path for a role's token
 */
// function getTokenFilePath(role: Role): string {
//     return path.join(TOKEN_DIR, `${role}.json`);
// }

/**
 * Load token from file
 * @returns TokenEntry if file exists and is valid, null if file doesn't exist or invalid
 */
function loadTokenFromFile(): TokenEntry | null {
    //const filePath = getTokenFilePath(role);

    // Check if file exists first (avoid error when reading non-existent file)
    if (!fs.existsSync(TOKEN_FILE)) {
        return null;
    }

    // File exists → try to read and parse
    try {
        const content = fs.readFileSync(TOKEN_FILE, "utf-8");
        return JSON.parse(content) as TokenEntry;
    } catch (error) {
        // File exists but invalid/corrupted → return null (will trigger token fetch)
        console.warn(`Failed to parse token file`, error);
        return null;
    }
}

/**
 * Save token to file
 */
function saveTokenToFile(entry: TokenEntry): void {
    //const filePath = getTokenFilePath(role);
    try {
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(entry, null, 2), "utf-8");
        console.log(`Token saved`);
    } catch (error) {
        console.error(`Failed to save token`, error);
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
async function fetchToken(): Promise<string> {
    console.log(`Fetching new token`);

    // Prepare OAuth2 password grant request
    //const creds = config.credentials[role];
    const form = new URLSearchParams();
    form.append("client_id", config.clientId);
    form.append("client_secret", config.clientSecret);
    form.append("scope", config.scope);
    form.append("grant_type", "client_credentials");
    //form.append("username", creds.username);
    //form.append("password", creds.password);

    // Request token from API
    const res = await axios.post(config.url.token, form, {
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
        createdAt: Math.floor(Date.now() / 1000),
    };

    // Save to file for future use
    saveTokenToFile(entry);
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
export async function getValidToken(): Promise<string> {
    // Try to load token from file
    const tokenEntry = loadTokenFromFile();

    // File doesn't exist → fetch new token
    if (!tokenEntry) {
        console.log(`Token file not found. Fetching new token...`);
        return await fetchToken();
    }

    // Token is still valid → use it
    if (isTokenValid(tokenEntry)) {
        console.log(`Using valid token from file`);
        return tokenEntry.token;
    }

    // Token expired → fetch new token
    console.log(`Token expired for role. Fetching new token...`);
    return await fetchToken();
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
export async function getToken(status: string): Promise<Record<string, string>> {
    // Normalize status (case insensitive, trim whitespace)
    const normalizedStatus = status.toLowerCase().trim() as "valid_token" | "invalid_token" | "no_token";

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
        const token = await getValidToken();
        return { Authorization: `Bearer ${token}` };
    }

    // Invalid status
    throw new Error(`Invalid auth status: ${status}. Must be one of: valid_token, invalid_token, no_token`);
}

/**
 * Clear token file for a role (useful for testing token refresh)
 */
export function clearToken(): void {
    //const filePath = getTokenFilePath(role);
    if (fs.existsSync(TOKEN_FILE)) {
        fs.unlinkSync(TOKEN_FILE);
        console.log(`🗑️ Token cleared`);
    }
}
