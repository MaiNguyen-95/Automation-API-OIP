import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { buildHeadersDynamic } from "../api/header/builderHeadersDynamic";
import { buildPayload } from "../api/payload/builderPayloadDynamic";
import { buildQueryFromTable } from "../api/queryParams/builderQueryDynamic";
import { executeDynamicRequest, executeCountryRequest } from "../api/restApi/requestExecutor";
import { readJsonPath } from "../api/response/jsonPath";
import type { CustomWorld } from "../support/world";
import { Utils } from "../common/utils/utils";
import { ApiEndpoints, ApiEndpointKey } from "../api/endpoints/apiEndpoints";
import { assertSchema } from "../api/response/validator";
import { ApiValidator } from "../api/validator/validator";
import { config, ServiceName, CountryServiceName } from "../support/config";

type TableRow = { key: string; value: string };

// Shared values
Given("I set shared values:", function (this: CustomWorld, dataTable: DataTable) {
    const rows = dataTable.hashes() as TableRow[];
    for (const r of rows) {
        const k = String(r.key || "").trim();
        if (!k) continue;
        // Store resolved string for immediate reuse
        this.dynamicValues[k] = this.resolveValue(String(r.value ?? ""));
    }
});

// Dynamic headers
Given("I build dynamic headers with:", function (this: CustomWorld, dataTable: DataTable) {
    const rows = dataTable.hashes() as TableRow[];
    const newHeaders = buildHeadersDynamic(rows, this.resolveValue.bind(this));
    this.dynamicHeaders = {
        ...this.dynamicHeaders,
        ...newHeaders,
    };
});

// build payload without override file
Given("I build payload from {string}", function (this: CustomWorld, payloadName: string) {
    this.requestPayload = buildPayload({ payloadName, resolve: this.resolveValue.bind(this) });
});

// Dynamic payload with override from table
Given("I build dynamic payload from {string} with:", function (this: CustomWorld, payloadName: string, dataTable: DataTable) {
    const rows = dataTable.hashes() as TableRow[];
    this.requestPayload = buildPayload({ payloadName, rows, resolve: this.resolveValue.bind(this) });
});

// Dynamic query params
Given("I build dynamic query params with:", function (this: CustomWorld, dataTable: DataTable) {
    const rows = dataTable.hashes() as TableRow[];
    this.dynamicQuery = buildQueryFromTable(rows, this.resolveValue.bind(this));
});

// Path params
Given("I set path params:", function (this: CustomWorld, dataTable: DataTable) {
    const rows = dataTable.hashes() as TableRow[];
    this.pathParams = {};
    for (const r of rows) {
        const k = String(r.key || "").trim();
        if (!k) continue;
        this.pathParams[k] = this.resolveValue(String(r.value ?? ""));
    }
});

// Send request
When("I send {string} request to {string} on {string} service", async function (this: CustomWorld, method: string, endpoint: ApiEndpointKey, service: ServiceName) {
    await executeDynamicRequest(this, service, method, endpoint);
});

// Send request for country service
When("I send {string} request to {string} on {string} service for {string} country",
    async function (this: CustomWorld, method: string, endpoint: ApiEndpointKey, service: string, country: string) {
        await executeCountryRequest(this, service as CountryServiceName, country, method, endpoint);
    }
);

When("I store response field {string} as {string}", function (this: CustomWorld, fieldPath: string, paramName: string) {
    if (!this.response?.data) {
        throw new Error("❌ Response data is empty");
    }

    const value = ApiValidator.getValueByPath(this.response.data, fieldPath);

    if (value === undefined) {
        throw new Error(`❌ Field '${fieldPath}' not found in response`);
    }

    this.sharedParams[paramName] = value;

    console.log(`✅ Stored response field [${fieldPath}] → {{${paramName}}}`);
    console.log(`📦 sharedParams:\n${JSON.stringify(this.sharedParams, null, 2)}`);
});

Then("The response status should be {int}", function (this: CustomWorld, expected: number) {
    ApiValidator.statusCode(this.response, expected);
});

Then("I save response path {string} as {string}", function (this: CustomWorld, path: string, key: string) {
    const from = this.responseBody;
    const value = readJsonPath(from, path);
    this.dynamicValues[key] = String(value);
});

Then("I save response body as {string}", function (this: CustomWorld, key: string) {
    const from = this.responseBody;
    console.log(from);
    this.dynamicValues[key] = JSON.stringify(from);
});

Then("response matches schema {string}", function (this: CustomWorld, schemaName: string) {
    const body = this.responseBody;
    const result = assertSchema(schemaName, body);
});

Then("the response should match json {string}", function (fileName: string) {
    ApiValidator.matchJsonFile(this.responseBody, fileName);
});

Then("the response body should contain {string}", function (text: string) {
    ApiValidator.bodyContains(this.responseBody, text);
});

Then("the array {string} length should be {int}", function (path: string, expectedLength: number) {
    ApiValidator.arrayLength(this.responseBody, path, expectedLength);
});

Then("the array {string} should have length greater than {int}", function (path: string, length: number) {
    ApiValidator.expectArrayLengthGreaterThan(this.responseBody, path, length);
});

Then("the array {string} should have length less than {int}", function (path: string, length: number) {
    ApiValidator.expectArrayLengthLessThan(this.responseBody, path, length);
});

Then("the response should contain:", function (dataTable: DataTable) {
    const rows = dataTable.hashes() as TableRow[];
    ApiValidator.containsJson(this.response.data, rows);
});
