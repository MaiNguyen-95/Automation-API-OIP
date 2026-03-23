import axios from "axios";
import { createHmac, randomBytes } from "crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "../../support/config";
import { getCountryConfig, getFullPhone } from "../../support/countryConfig";

// ============================================================================
// CONSTANTS
// ============================================================================

const ENV_MAP: Record<string, Record<string, string>> = {
    stage: { azure: "integration", auth0: "stage" },
    preprod: { azure: "stage", auth0: "preprod" },
    production: { azure: "production", auth0: "production" },
};

const VENDOR_MAP: Record<string, string> = {
    "+254": "africas-talking",
    "+255": "africas-talking",
    "+91": "aws-sns",
    "+62": "bird",
};

// ============================================================================
// HELPERS
// ============================================================================

function generateHMAC(data: string, secret: string): string {
    return createHmac("sha256", secret).update(data).digest("hex");
}

function getVendor(phone: string): string {
    for (const [prefix, vendor] of Object.entries(VENDOR_MAP)) {
        if (phone.startsWith(prefix)) return vendor;
    }
    return "twilio";
}

// ============================================================================
// TOKEN CACHE
// ============================================================================

const TOKEN_DIR = path.resolve(process.cwd(), "src/api/auth/saveAuth/tokens");

if (!fs.existsSync(TOKEN_DIR)) {
    fs.mkdirSync(TOKEN_DIR, { recursive: true });
}

type OtpTokenEntry = { token: string; country: string; createdAt: number; expiresAt: number };

function getCachePath(country: string): string {
    return path.join(TOKEN_DIR, `otp_${country}.json`);
}

function loadCachedToken(country: string): string | null {
    const filePath = getCachePath(country);
    if (!fs.existsSync(filePath)) return null;
    try {
        const entry: OtpTokenEntry = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (entry.expiresAt > Math.floor(Date.now() / 1000) + 60) {
            // console.log(`✅ Using cached OTP token for country: ${country}`);
            return entry.token;
        }
    } catch {}
    return null;
}

function saveCachedToken(country: string, token: string, expiresIn = 3600): void {
    const now = Math.floor(Date.now() / 1000);
    const entry: OtpTokenEntry = { token, country, createdAt: now, expiresAt: now + expiresIn };
    fs.writeFileSync(getCachePath(country), JSON.stringify(entry, null, 2), "utf-8");
    // console.log(`💾 Token cached for country: ${country}`);
}

// ============================================================================
// STEP 1: SEND OTP
// ============================================================================

async function sendOtp(phone: string, domain: string, authClientId: string, country: string, locale: string): Promise<void> {
    const url = `${config.otp.smsBaseUrl}/azure-b2c/send-otp`;

    const body = {
        domain,
        clientId: authClientId,
        phoneNumber: phone,
        locale,
        redirectUri: config.otp.redirectUri,
        country,
    };

    // console.log(`📤 Sending OTP to ${phone} (${country})...`);
    const res = await axios.post(url, body, {
        headers: { "Content-Type": "application/json", "x-country-code": country, "x-app-platform": "web", "x-app-version": "bodega" },
        validateStatus: () => true,
    });

    if (res.status >= 400) {
        throw new Error(`Send OTP failed: ${res.status} ${JSON.stringify(res.data)}`);
    }
    // console.log(`✅ OTP sent`);
}

// ============================================================================
// STEP 2: READ OTP (readsms + HMAC)
// ============================================================================

async function readOtp(phone: string, maxRetries = 5, delayMs = 3000): Promise<string> {
    const vendor = getVendor(phone);
    const smsEnv = ENV_MAP[config.otp.environment]?.[config.otp.authService] || config.otp.environment;

    for (let i = 1; i <= maxRetries; i++) {
        // console.log(`📩 Reading OTP (${i}/${maxRetries})...`);

        const body = JSON.stringify({ recipient: phone, environment: smsEnv, vendor });
        const hmac = generateHMAC(body, config.otp.hmacSecret);

        const res = await axios.post(`${config.otp.smsBaseUrl}/readsms`, body, {
            headers: { "Content-Type": "application/json", Authorization: hmac },
            validateStatus: () => true,
        });

        const match = JSON.stringify(res.data).match(/(?<!\d)\d{5}(?!\d)/);
        if (match) {
            // console.log(`✅ OTP: ${match[0]}`);
            return match[0];
        }

        if (i < maxRetries) await new Promise((r) => setTimeout(r, delayMs));
    }

    throw new Error(`OTP not found after ${maxRetries} retries for ${phone}`);
}

// ============================================================================
// STEP 3: VERIFY OTP → TOKEN
// ============================================================================

async function verifyOtp(phone: string, otp: string, domain: string, authClientId: string, country: string, locale: string): Promise<string> {
    const url = `${config.otp.smsBaseUrl}/azure-b2c/verify-otp`;

    // PKCE code_verifier must be 43-128 chars (RFC 7636)
    const codeChallenge = randomBytes(32).toString("base64url");

    const body = {
        domain,
        clientId: authClientId,
        phoneNumber: phone,
        email: "",
        otp,
        redirectUri: config.otp.redirectUri,
        authParams: {
            responseType: "code",
            codeChallenge,
            codeChallengeMethod: "plain",
            scope: `${authClientId} openid offline_access`,
        },
        locale,
        country,
    };

    // console.log(`🔐 Verifying OTP for ${phone}...`);
    const res = await axios.post(url, body, {
        headers: { "Content-Type": "application/json", "x-country-code": country, "x-app-platform": "web", "x-app-version": "bodega" },
        validateStatus: () => true,
    });

    if (res.status >= 400) {
        throw new Error(`Verify OTP failed: ${res.status} ${JSON.stringify(res.data)}`);
    }

    // Case 1: Direct token in response
    const directToken = res.data?.access_token || res.data?.token || res.data?.accessToken;
    if (directToken) {
        // console.log(`✅ Token obtained directly from verify-otp`);
        return directToken;
    }

    // Case 2: redirectUrl → follow redirect to get auth code → exchange for token
    const redirectUrl = res.data?.redirectUrl || res.data?.redirect_url;
    if (redirectUrl) {
        // console.log(`🔄 Got redirectUrl, following to get auth code...`);
        return await exchangeRedirectForToken(redirectUrl, domain, authClientId, codeChallenge);
    }

    // console.log("Response:", JSON.stringify(res.data, null, 2));
    throw new Error("No access_token or redirectUrl in verify-otp response");
}

// ============================================================================
// STEP 4: FOLLOW REDIRECT → GET CODE → EXCHANGE FOR TOKEN
// ============================================================================

/**
 * Extract cookies from set-cookie headers
 */
function extractCookies(headers: any): string {
    const setCookies: string[] = headers?.["set-cookie"] || [];
    return setCookies.map((c: string) => c.split(";")[0]).join("; ");
}

/**
 * Merge cookie strings
 */
function mergeCookies(...parts: string[]): string {
    return parts.filter(Boolean).join("; ");
}

async function exchangeRedirectForToken(redirectUrl: string, _domain: string, authClientId: string, codeVerifier: string): Promise<string> {
    const parsed = new URL(redirectUrl);
    const tenant = parsed.pathname.split("/")[1]; // e.g. YaraFPStage.onmicrosoft.com
    const policy = parsed.searchParams.get("p") || "B2C_1A_CST_CUSTOM_IDP";
    const b2cBase = `${parsed.origin}/${tenant}/${policy}`;

    // Step 1: GET authorize URL → Azure B2C sets session cookies then redirects to login page
    // console.log(`📄 Step 1: GET authorize URL...`);

    // Step 1a: Initial request — capture B2C session cookies (don't follow redirects)
    const initRes = await axios
        .get(redirectUrl, {
            maxRedirects: 0,
            validateStatus: () => true,
        })
        .catch((err) => {
            if (err.response && [301, 302].includes(err.response.status)) return err.response;
            throw err;
        });

    let cookies = extractCookies(initRes.headers);
    let html = "";

    // Step 1b: Follow redirect to login page if needed
    if ([301, 302].includes(initRes.status) && initRes.headers.location) {
        const loginPageRes = await axios.get(initRes.headers.location, {
            headers: { Cookie: cookies },
            maxRedirects: 5,
            validateStatus: () => true,
        });
        cookies = mergeCookies(cookies, extractCookies(loginPageRes.headers));
        html = typeof loginPageRes.data === "string" ? loginPageRes.data : "";
    } else {
        html = typeof initRes.data === "string" ? initRes.data : "";
    }

    // Extract CSRF token and transId from HTML (Azure B2C embeds these in page settings)
    const csrfMatch = html.match(/csrf["']?\s*[:=]\s*["']([^"']+)/i);
    const transIdMatch = html.match(/transId["']?\s*[:=]\s*["']([^"']+)/i);
    const csrf = csrfMatch?.[1] || "";
    const transId = transIdMatch?.[1] || "";

    // Extract params from original redirect URL
    const username = parsed.searchParams.get("username") || "";
    const password = parsed.searchParams.get("password") || "";
    // code_verifier = codeVerifier passed from verifyOtp (same value sent as code_challenge)

    if (!csrf || !transId) {
        // console.log("HTML (first 500 chars):", html.substring(0, 500));
        throw new Error(`Missing csrf (${csrf ? "found" : "missing"}) or transId (${transId ? "found" : "missing"}) from authorize page`);
    }

    // console.log(`✅ Got csrf & transId`);

    // Step 2: POST to SelfAsserted → submit credentials
    // console.log(`📄 Step 2: POST SelfAsserted (login)...`);
    const selfAssertedUrl = `${b2cBase}/SelfAsserted?tx=${transId}&p=${policy}`;

    const selfAssertedRes = await axios.post(selfAssertedUrl, new URLSearchParams({ signInName: username, password }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-csrf-token": csrf,
            Cookie: cookies,
        },
        maxRedirects: 0,
        validateStatus: () => true,
    });

    cookies = mergeCookies(cookies, extractCookies(selfAssertedRes.headers));
    // console.log(`✅ SelfAsserted status: ${selfAssertedRes.status}`);

    // Step 3: GET confirmed → Azure B2C redirects to redirect_uri with code
    // console.log(`📄 Step 3: GET confirmed → get auth code...`);
    const confirmedUrl = `${b2cBase}/api/CombinedSigninAndSignup/confirmed?rememberMe=false&csrf_token=${csrf}&tx=${transId}&p=${policy}`;

    const confirmedRes = await axios
        .get(confirmedUrl, {
            headers: { Cookie: cookies },
            maxRedirects: 0,
            validateStatus: () => true,
        })
        .catch((err) => {
            if (err.response && [301, 302].includes(err.response.status)) return err.response;
            throw err;
        });

    const location = confirmedRes.headers?.location || "";
    const codeMatch = location.match(/[?&]code=([^&]+)/);
    if (!codeMatch) {
        // console.log("Confirmed status:", confirmedRes.status);
        // console.log("Redirect Location:", location.substring(0, 200));
        throw new Error("No authorization code found in redirect");
    }

    const authCode = decodeURIComponent(codeMatch[1]);
    // console.log(`✅ Got auth code: ${authCode.substring(0, 30)}...`);

    // Step 4: Exchange auth code for access token
    // console.log(`🔑 Step 4: Exchanging code for token...`);
    const tokenUrl = `${b2cBase}/oauth2/v2.0/token`;

    const form = new URLSearchParams();
    form.append("grant_type", "authorization_code");
    form.append("client_id", authClientId);
    form.append("code", authCode);
    form.append("redirect_uri", config.otp.redirectUri);
    form.append("code_verifier", codeVerifier);

    const tokenRes = await axios.post(tokenUrl, form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        validateStatus: () => true,
    });

    if (tokenRes.status >= 400) {
        throw new Error(`Token exchange failed: ${tokenRes.status} ${JSON.stringify(tokenRes.data)}`);
    }

    const token = tokenRes.data?.access_token;
    if (!token) {
        throw new Error("No access_token in token exchange response");
    }

    // console.log(`✅ Token obtained via code exchange`);
    return token;
}

// ============================================================================
// PUBLIC: FULL LOGIN FLOW
// ============================================================================

export async function loginViaOtp(country: string): Promise<string> {
    const cached = loadCachedToken(country);
    if (cached) return cached;

    const cfg = getCountryConfig(country);
    const phone = getFullPhone(country);
    const { domain, authClientId, defaultLocale } = cfg;

    await sendOtp(phone, domain, authClientId, country, defaultLocale);
    const otp = await readOtp(phone);
    const token = await verifyOtp(phone, otp, domain, authClientId, country, defaultLocale);

    saveCachedToken(country, token);
    return token;
}
