import { Then } from "@cucumber/cucumber";
import { assertSchema } from "../api/response/validator";
import { readJsonPath } from "../api/response/jsonPath";
import type { CustomWorld } from "../support/world";

Then("response matches schema {string}", function (this: CustomWorld, schemaName: string) {
    const body = (this as any).responseBody;
    const result = assertSchema(schemaName, body);
});
