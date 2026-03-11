import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { getToken } from "../api/auth/authManager";

Given("I am authenticated as {string}", async function (this: CustomWorld, value: string) {
    const token = await getToken(value);
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
});
