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

    static random4Char4Digit(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const digits = "0123456789";
        const randomChars = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
        const randomDigits = Array.from({ length: 4 }, () => digits.charAt(Math.floor(Math.random() * digits.length))).join("");
        return randomChars + randomDigits;
    }

    static splitString(text: string): string[] {
        return text
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
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

    //#region File / JSON Utilities

    static loadJson(relativePath: string): any {
        const fullPath = path.join(process.cwd(), relativePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error(`JSON file not found: ${fullPath}`);
        }

        const raw = fs.readFileSync(fullPath, "utf-8");
        return JSON.parse(raw);
    }

    static loadRequestPayload(name: string): any {
        const filePath = path.join(process.cwd(), "src/data/requestPayloads", `${name}.json`);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Payload file not found: ${filePath}`);
        }

        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw);
    }

    static loadResponsePayload(name: string): any {
        const filePath = path.join(process.cwd(), "src/data/responsePayloads", `${name}.json`);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Response file not found: ${filePath}`);
        }

        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw);
    }

    //#endregion
}
