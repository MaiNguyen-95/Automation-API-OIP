import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { execSync } from "child_process";
import * as path from "path";
import { getToken, getCountryToken } from "../api/auth/authManager";
import type { ServiceName, CountryServiceName } from "../support/config";

Given("I am {string} authenticated on {string} service", async function (this: CustomWorld, status: string, service: ServiceName) {
    const token = await getToken(status, service);
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
});

Given("I am {string} authenticated on {string} service for {string} country", async function (this: CustomWorld, status: string, service: CountryServiceName, country: string) {
    const token = await getCountryToken(status, service, country);
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
    this.countryService = { service, country };
});

Given("I authenticate using token {string}", function (this: CustomWorld, token: string) {
    // We add the direct token read from the CSV to the dynamicHeaders setup.
    // Adjust 'Authorization' or 'x-jwt-token' format if needed by your API framework.
    this.dynamicHeaders = {
        ...(this.dynamicHeaders ?? {}),
        Authorization: `Bearer ${token}`
    };
});
