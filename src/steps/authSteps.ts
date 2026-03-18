import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
// import { config, ServiceName } from "../support/config";
import { getCsvTokenHeader } from "../api/auth/csvToeknReader";
import { execSync } from "child_process";
import * as path from "path";
// Given("I am authenticated as {string}", async function (this: CustomWorld, value: string) {
//     const token = await getToken(value, );
//     this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
// });
import { getToken, getCountryToken } from "../api/auth/authManager";
import type { ServiceName, CountryServiceName } from "../support/config";

Given("I am {string} authenticated on {string} service", async function (this: CustomWorld, status: string, service: ServiceName) {
    const token = await getToken(status, service);
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
});

Given("I am authenticated with token from CSV {string}", function (this: CustomWorld, csvPath: string) {
    const tokenHeader = getCsvTokenHeader(csvPath);
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...tokenHeader };
});

Given("I execute scenario {string} in project {string} to get token", function (scenarioTag: string, relativePath: string) {
    // Resolve relative path from the Automation-API project root (where you run npm test)
    const resolvedPath = path.resolve(process.cwd(), relativePath);
    console.log(`\nExecuting scenario ${scenarioTag} from: ${resolvedPath}...`);
    try {
        execSync(`npm run test -- --tags "${scenarioTag}"`, {
            cwd: resolvedPath,
            stdio: "inherit",
        });
        console.log("Token generation completed.");
    } catch (error) {
        console.error(`Failed to generate token from project at: ${resolvedPath}`);
        throw error;
    }
Given("I am {string} authenticated on {string} service for {string} country", async function (this: CustomWorld, status: string, service: CountryServiceName, country: string) {
    const token = await getCountryToken(status, service, country);
    this.dynamicHeaders = { ...(this.dynamicHeaders ?? {}), ...token };
    this.countryService = { service, country };
});
