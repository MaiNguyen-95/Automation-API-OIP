import { ServiceName } from "@support/config";
import fs from "fs";
import path from "path";

/**
 * Config auth theo service
 */
const serviceConfig: Record<
    ServiceName,
    {
        auth: "bearer" | "cookie";
        useTenant?: boolean;
    }
> = {
    oip_service: {
        auth: "cookie",
        useTenant: true,
    },
};

/**
 * Lấy tenantId từ ENV
 */
function getTenantId(): string {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
        throw new Error("TENANT_ID missing in .env");
    }
    return tenantId.trim();
}

/**
 * Build header từ token
 */
function buildAuthHeader(service: ServiceName, token: string, existingHeaders?: Record<string, string>): Record<string, string> {
    const config = serviceConfig[service];

    if (!config) {
        throw new Error(`Missing config for service: ${service}`);
    }

    const headers: Record<string, string> = {};

    const cleanToken = token.split(";")[0].trim();

    if (config.auth === "cookie") {
        headers["Cookie"] = `accessToken=${cleanToken}`;
    } else {
        headers["Authorization"] = `Bearer ${cleanToken}`;
    }

    // add tenant nếu chưa có
    if (config.useTenant) {
        const hasTenant = existingHeaders?.["x-tenant-id"] || existingHeaders?.["tenantid"];

        if (!hasTenant) {
            headers["x-tenant-id"] = getTenantId();
        }
    }

    return headers;
}

/**
 * Lấy token từ file (OIP)
 */
function getOipTokenFromFile(): string {
    try {
        const filePath = path.resolve(__dirname, "./saveAuth/tokens/oip_service.json");
        const raw = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(raw);

        if (!data.token) {
            throw new Error("Token not found in oip_service.json");
        }

        return data.token;
    } catch (err) {
        throw new Error("❌ Cannot read oip_service.json: " + err);
    }
}

/**
 * Lấy token theo service (FIX: bỏ getTokenForService)
 */
async function resolveToken(service: ServiceName): Promise<string> {
    if (service === "oip_service") {
        return getOipTokenFromFile();
    }

    throw new Error(`No token handler for service: ${service}`);
}

/**
 * MAIN FUNCTION
 */
export async function getTokenService(statusOrService: string, serviceName?: ServiceName, existingHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const raw = String(statusOrService ?? "")
        .toLowerCase()
        .trim();

    const normalizedStatus =
        raw === "valid_token" || raw === "valid" || raw === "token" ? "valid_token" : raw === "invalid_token" || raw === "invalid" ? "invalid_token" : raw === "no_token" || raw === "notoken" || raw === "no" ? "no_token" : undefined;

    /**
     * 👉 Truyền trực tiếp service (VD: "oip_service")
     */
    if (!normalizedStatus) {
        const svc = raw as ServiceName;
        const token = await resolveToken(svc);
        return buildAuthHeader(svc, token, existingHeaders);
    }

    /**
     * 👉 No token
     */
    if (normalizedStatus === "no_token") {
        return {};
    }

    /**
     * 👉 Invalid token
     */
    if (normalizedStatus === "invalid_token") {
        const svc = (serviceName || "oip_service") as ServiceName;
        const config = serviceConfig[svc];

        const headers: Record<string, string> = {};

        if (config.auth === "cookie") {
            headers["Cookie"] = "accessToken=invalid_token";
        } else {
            headers["Authorization"] = "Bearer invalid_token";
        }

        if (config.useTenant) {
            headers["x-tenant-id"] = getTenantId();
        }

        return headers;
    }

    /**
     * 👉 Valid token
     */
    if (normalizedStatus === "valid_token") {
        const svc = (serviceName || "oip_service") as ServiceName;

        const token = await resolveToken(svc);

        return buildAuthHeader(svc, token, existingHeaders);
    }

    throw new Error("Invalid auth status");
}
