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

    static splitString(text: string): string[] {
        return text
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }

    //#endregion

    //#region Date/Time Utilities

    private static format(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    private static clone(date: Date): Date {
        return new Date(date.getTime());
    }

    // ===== Current =====
    static currentDateTime(): string {
        const d = new Date();
        return `${this.format(d)} ${d.toTimeString().split(" ")[0]}`; // YYYY-MM-DD HH:mm:ss
    }

    static currentDate(): string {
        return this.format(new Date());
    }

    static getCurrentMonth(): string {
        return String(new Date().getMonth() + 1).padStart(2, "0");
    }

    static currentYear(): string {
        return String(new Date().getFullYear());
    }

    static timestamp(): number {
        return Date.now();
    }

    // ===== Day operations =====
    static addDays(days: number): string {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return this.format(d);
    }

    static futureDate(days: number): string {
        return this.addDays(days);
    }

    static pastDate(days: number): string {
        return this.addDays(-days);
    }

    static getDate(keyword: "yesterday" | "today" | "tomorrow"): string {
        switch (keyword) {
            case "yesterday":
                return this.addDays(-1);
            case "today":
                return this.currentDate();
            case "tomorrow":
                return this.addDays(1);
        }
    }

    // ===== Month operations) =====
    private static shiftMonth(offset: number): Date {
        const d = new Date();
        const day = d.getDate();

        d.setDate(1);
        d.setMonth(d.getMonth() + offset);

        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        d.setDate(Math.min(day, lastDay));

        return d;
    }

    static getNextMonth(): string {
        const d = this.shiftMonth(1);
        return String(d.getMonth() + 1).padStart(2, "0");
    }

    static getLastMonth(): string {
        const d = this.shiftMonth(-1);
        return String(d.getMonth() + 1).padStart(2, "0");
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
