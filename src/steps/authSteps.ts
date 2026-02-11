import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { getToken } from "../api/auth/authManager";
import { Role } from "../support/config";

Given("I am authenticated as {string}", async function (this: CustomWorld, value: string) {
    const token = await getToken(value as Role | "invalid" | "notoken");
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
});
