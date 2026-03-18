import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
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
