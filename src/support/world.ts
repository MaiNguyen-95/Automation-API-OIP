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
        this.dynamicValues["tenantId"] = config.tenantId!;
    }

    resolveValue(raw: string): string {
        if (!raw) return raw;

        return raw.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
            if (!(key in this.dynamicValues)) {
                throw new Error(`Dynamic value '${key}' not found`);
            }
            return this.dynamicValues[key];
        });
    }
}

setWorldConstructor(CustomWorld);
