import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { getToken } from "../api/auth/authManager";
import { config, ServiceName } from "../support/config";

// Given("I am authenticated as {string}", async function (this: CustomWorld, value: string) {
//     const token = await getToken(value, );
//     this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
// });

Given("I am {string} authenticated on {string} service", async function (this: CustomWorld, status: string, service: ServiceName) {
    const token = await getToken(status, service);
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
});
