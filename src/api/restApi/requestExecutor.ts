import { resolvePathTemplate } from "../pathResolver/builderPathsDynamic";
import { CustomWorld } from "../../support/world";
import axios from "axios";
import { config } from "../../support/config";
import { ApiEndpoints, ApiEndpointKey } from "../endpoints/apiEndpoints";

export async function executeDynamicRequest(world: CustomWorld, method: string, endpointKey: ApiEndpointKey): Promise<void> {
    const resolver = world.resolveValue.bind(world);

    const client = axios.create({
        baseURL: config.baseUrl,
        timeout: 60000,
        headers: { "Content-Type": "application/json" },
    });

    const rawPath = ApiEndpoints[endpointKey];
    if (!rawPath) {
        throw new Error(`❌ Endpoint key "${endpointKey}" not found in ApiEndpoints`);
    }
    const url = resolvePathTemplate(rawPath, world.pathParams, resolver);
    console.log("URL:", url);
    try {
        const response = await client.request({
            method: method.toLowerCase(),
            url,
            data: world.requestPayload,
            params: world.dynamicQuery,
            headers: world.dynamicHeaders,
            validateStatus: () => true,
        });
        console.log("Dynamic Header:", world.dynamicHeaders);
        console.log("Query params:", world.dynamicQuery);
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
