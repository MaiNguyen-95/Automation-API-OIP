import { setWorldConstructor, setDefaultTimeout, IWorldOptions, World } from "@cucumber/cucumber";
import { config } from "../support/config";
import { AxiosResponse } from "axios";
import { DynamicValueEngine } from "../common/utils/dynamicValueEngineUtils";

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
    dynamicValues: Record<string, any> = {};
    //timezone?: string;
    countryService?: { service: string; country: string };

    constructor(options: IWorldOptions) {
        super(options);
        this.dynamicValues["tenantId"] = config.tenantId!;
    }

    resolveValue(raw: string): any {
        const engine = new DynamicValueEngine(this.dynamicValues);
        return engine.resolve(raw);
    }
}

setWorldConstructor(CustomWorld);
