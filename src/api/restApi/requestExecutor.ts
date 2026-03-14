import { resolvePathTemplate } from "../pathResolver/builderPathsDynamic";
import { CustomWorld } from "../../support/world";
import axios from "axios";
import { config, ServiceName, CountryServiceName, getCountryServiceConfig } from "../../support/config";
import { ApiEndpoints, ApiEndpointKey } from "../endpoints/apiEndpoints";

async function executeRequest(world: CustomWorld, baseURL: string, serviceName: string, method: string, endpointKey: ApiEndpointKey): Promise<void> {
    const resolver = world.resolveValue.bind(world);

    const client = axios.create({
        baseURL,
        timeout: 60000,
        headers: { "Content-Type": "application/json" },
    });

    const rawPath = ApiEndpoints[endpointKey];
    if (!rawPath) {
        throw new Error(`❌ Endpoint key "${endpointKey}" not found in ApiEndpoints`);
    }

    const url = resolvePathTemplate(rawPath, world.pathParams, resolver);

    console.log("Service:", serviceName);
    console.log("URL:", `${baseURL}${url}`);

    try {
        const response = await client.request({
            method: method.toLowerCase(),
            url,
            data: world.requestPayload,
            params: world.dynamicQuery,
            headers: world.dynamicHeaders,
            validateStatus: () => true,
        });

        console.log("Headers:", world.dynamicHeaders);
        console.log("Query:", world.dynamicQuery);

        world.response = response;
        world.responseBody = response.data;
        world.responseStatus = response.status;
        world.responseHeaders = response.headers;
    } catch (err: any) {
        const resp = err?.response;

        if (resp) {
            world.response = resp;
            world.responseBody = resp.data;
            world.responseStatus = resp.status;
            world.responseHeaders = resp.headers;
            world.error = err;
        } else {
            throw err;
        }
    }
}

export async function executeDynamicRequest(world: CustomWorld, service: ServiceName, method: string, endpointKey: ApiEndpointKey): Promise<void> {
    const serviceConfig = config.services[service];
    if (!serviceConfig) {
        throw new Error(`❌ Service "${service}" not found in config.services`);
    }
    await executeRequest(world, serviceConfig.baseURL, service, method, endpointKey);
}

export async function executeCountryRequest(world: CustomWorld, service: CountryServiceName, country: string, method: string, endpointKey: ApiEndpointKey): Promise<void> {
    const svcConfig = getCountryServiceConfig(service, country);
    // Auto-add x-country-code header for country-based requests
    world.dynamicHeaders = {
        ...world.dynamicHeaders,
        "x-country-code": country,
    };
    await executeRequest(world, svcConfig.baseURL, `${service}:${country}`, method, endpointKey);
}
