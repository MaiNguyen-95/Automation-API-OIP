import { resolvePathTemplate } from "./pathResolver";
import { CustomWorld } from "../../support/world";
import axios from "axios";
import { config } from "../../support/config";

export async function executeDynamicRequest(world: CustomWorld, method: string, pathTemplate: string): Promise<void> {
    const resolver = world.resolveValue.bind(world);

    const client = axios.create({
        baseURL: config.baseUrl,
        timeout: 60000,
        headers: { "Content-Type": "application/json" },
    });

    const url = resolvePathTemplate(pathTemplate, world.pathParams, resolver);

    try {
        const response = await client.request({
            method: method.toLowerCase(),
            url,
            data: world.requestPayload,
            params: world.dynamicQuery,
            headers: world.dynamicHeaders,
            validateStatus: () => true, // không throw ở đây, để step assert
        });

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
