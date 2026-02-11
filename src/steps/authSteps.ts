import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { AuthStatus, getToken } from "../api/auth/authManager";

Given("I am authenticated as {string}", async function (this: CustomWorld, value: AuthStatus) {
    const token = await getToken(value);
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
});
