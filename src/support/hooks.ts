import { Before, After, AfterAll } from "@cucumber/cucumber";
import { CustomWorld } from "./world";
import path from "path";
import { config } from "../support/config";

// Track whether any non-API (UI) scenarios executed
// let executedUiScenarios = 0;

// Mark UI scenarios (anything not tagged @api)
// Before({ tags: "not @api" }, async function () {
//     executedUiScenarios++;
// });
