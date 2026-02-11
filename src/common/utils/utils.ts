import assert from "assert";
import fs from "fs";
import path from "path";

export class Utils {
    //#region String Utilities

    static randomString(length: number): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    }

    static capitalize(str: string): string {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static randomDigit(length: number): string {
        const digits = "0123456789";
        return Array.from({ length }, () => digits.charAt(Math.floor(Math.random() * digits.length))).join("");
    }

    //#endregion

    //#region Date/Time Utilities

    static currentDateTime(): string {
        return new Date().toISOString();
    }

    static currentDate(): string {
        return new Date().toISOString().split("T")[0];
    }

    static futureDate(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split("T")[0];
    }

    static pastDate(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split("T")[0];
    }

    static getDate(keyword: string): string {
        const today = new Date();

        switch (keyword.toLowerCase()) {
            case "yesterday":
                today.setDate(today.getDate() - 1);
                break;
            case "today":
                break; // do nothing
            case "tomorrow":
                today.setDate(today.getDate() + 1);
                break;
            default:
                throw new Error(`Unsupported keyword: ${keyword}`);
        }

        //return today.toISOString().split("T")[0]; // format: YYYY-MM-DD
        const formatter = new Intl.DateTimeFormat("en-GB"); // DD/MM/YYYY
        const formattedDate = formatter.format(today);

        return formattedDate;
    }

    static getCurrentMonth(): string {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return month; // e.g. '11' for November
    }

    static getNextMonth(): string {
        const date = new Date();
        date.setMonth(date.getMonth() + 1); // 👉 đẩy tháng đi 1 đơn vị
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return month;
    }

    static getLastMonth(): string {
        const date = new Date();
        date.setMonth(date.getMonth() + 1); // 👉 đẩy tháng đi 1 đơn vị
        const month = String(date.getMonth() - 1).padStart(2, "0");
        return month;
    }
    static currentYear(): string {
        const date = new Date();
        const year = String(date.getFullYear());
        return year; // e.g. '2023'
    }
    static timestamp(): number {
        return Date.now();
    }

    //#endregion

    //#region Fake Data Generators

    static randomEmail(): string {
        return `user_${Utils.randomString(6)}@example.com`;
    }

    static randomPhoneNumber(): string {
        const prefix = ["090", "091", "092"];
        return `${prefix[Math.floor(Math.random() * prefix.length)]}${Math.floor(1000000 + Math.random() * 9000000)}`;
    }

    //#endregion

    //#region General Helpers

    static waitFor(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    static generateBagTag(): string {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0"); // 2 chữ số
        const month = String(now.getMonth() + 1).padStart(2, "0"); // tháng (0-index)
        return `QA${day}${month}${this.randomDigit(2)}:test`;
    }

    //#endregion

    //#region JSON Utilities
    static getValueByPath(obj: any, path: string): any {
        if (!obj || !path) return undefined;

        const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
        const keys = normalizedPath.split(".");

        return keys.reduce((current, key) => {
            if (current === undefined || current === null) return undefined;
            return current[key];
        }, obj);
    }

    /**
     * compare full JSON (actual vs expected)
     */

    static loadJson(relativePath: string): any {
        const fullPath = path.join(process.cwd(), relativePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Expected JSON file not found: ${fullPath}`);
        }
        const raw = fs.readFileSync(fullPath, "utf-8");
        return JSON.parse(raw);
    }

    static assertJsonEqual(actual: any, expectedJson: string) {
        const expected = JSON.parse(expectedJson);
        assert.deepStrictEqual(actual, expected);
        console.log("✅ Full response matches expected JSON");
    }

    /**
     * compare partial JSON (subset)
     */

    static assertJsonContains(actual: any, expected: Record<string, any>) {
        for (const [pathKey, expectedValue] of Object.entries(expected)) {
            const actualValue = Utils.getValueByPath(actual, pathKey);
            if (actualValue === undefined) {
                throw new Error(`❌ Path '${pathKey}' not found in response`);
            }
            assert.strictEqual(String(actualValue), String(expectedValue), `Mismatch at '${pathKey}': expected '${expectedValue}', but got '${actualValue}'`);
        }
        console.log("✅ Partial response matches");
    }

    /**
     * compare params in specific field
     */
    static assertFieldEqual(actual: any, path: string, expectedValue: string) {
        const value = Utils.getValueByPath(actual, path);
        assert.strictEqual(value, expectedValue, `Expected ${path} = ${expectedValue}, but got ${value}`);
        console.log(`✅ Field ${path} matches: ${expectedValue}`);
    }

    //#endregion
}
