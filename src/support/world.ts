import { setWorldConstructor, setDefaultTimeout, IWorldOptions, World } from "@cucumber/cucumber";
import { config } from "../support/config";
import { AxiosResponse } from "axios";

setDefaultTimeout(120000);

export class CustomWorld extends World {
    // -------- Core --------
    config = config;

    // -------- Request --------
    requestPayload?: Record<string, any>;
    dynamicHeaders: Record<string, string> = {};
    dynamicQuery?: Record<string, any>;
    pathParams?: Record<string, string>;

    // -------- Response --------
    response!: AxiosResponse;
    responseBody!: unknown;
    responseStatus!: number;
    responseHeaders!: any;
    error!: any;

    // -------- Shared & dynamic --------
    sharedParams: Record<string, any> = {};
    dynamicValues: Record<string, string> = {};

    constructor(options: IWorldOptions) {
        super(options);

        // ✅ tenant
        this.dynamicValues["tenantId"] = config.tenantId!;
        this.dynamicValues["x-tenant-id"] = config.tenantId!;

        // ✅ thêm cookie cần thiết (fix 403)
        this.dynamicValues["moe_uuid"] = process.env.MOE_UUID || "";
        this.dynamicValues["refreshToken"] = process.env.REFRESH_TOKEN || "";
    }

    /**
     * Resolve dynamic value {{key}}
     */
    resolveValue(raw: string): string {
        if (!raw) return raw;

        return raw.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
            if (!(key in this.dynamicValues)) {
                throw new Error(`Dynamic value '${key}' not found`);
            }
            return this.dynamicValues[key];
        });
    }

    /**
     * ✅ Helper: set header (auto normalize tenant)
     */
    setHeader(key: string, value: string) {
        const normalizedKey = key.toLowerCase() === "tenantid" ? "x-tenant-id" : key;

        this.dynamicHeaders[normalizedKey] = value;
    }

    /**
     * ✅ Helper: build cookie đầy đủ (QUAN TRỌNG)
     */
    buildCookie(accessToken: string) {
        const cookies = [`accessToken=${accessToken}`, this.dynamicValues["refreshToken"] ? `refreshToken=${this.dynamicValues["refreshToken"]}` : "", this.dynamicValues["moe_uuid"] ? `moe_uuid=${this.dynamicValues["moe_uuid"]}` : ""]
            .filter(Boolean)
            .join("; ");

        this.dynamicHeaders["Cookie"] = cookies;
    }
}

setWorldConstructor(CustomWorld);
