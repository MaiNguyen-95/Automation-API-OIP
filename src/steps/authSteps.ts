import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { getTokenService } from "../api/auth/authManager";
import { config, ServiceName } from "../support/config";

Given("I am {string} authenticated on {string} service is", async function (status: string, service: ServiceName) {
    const token = await getTokenService(status, service, this.dynamicHeaders);

    this.dynamicHeaders = {
        ...(this.dynamicHeaders ?? {}),
        ...token,
    };
});
