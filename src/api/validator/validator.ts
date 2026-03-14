import { expect } from "@playwright/test";
import { AxiosResponse } from "axios";
import { Utils } from "../../common/utils/utils";

type TableRow = { key: string; value: any };

export class ApiValidator {
    // ===== INTERNAL HELPER =====

    static getValueByPath(obj: any, path: string): any {
        if (!obj || !path) return undefined;

        const normalizedPath = path
            .replace(/^\$\./, "")
            .replace(/^\$/, "")
            .replace(/\[(\d+)\]/g, ".$1");

        const keys = normalizedPath.split(".").filter(Boolean);

        return keys.reduce((current, key) => {
            if (current == null) return undefined;
            return current[key];
        }, obj);
    }

    // ===== PARSE DATATABLE VALUE =====
    static parseValue(value: any): any {
        if (value === "true") return true;
        if (value === "false") return false;
        if (value === "null") return null;

        if (!isNaN(Number(value))) return Number(value);

        return value;
    }
    // ===== STATUS CODE =====
    static statusCode(response: AxiosResponse, expected: number) {
        expect(response.status).toBe(expected);
    }

    // ===== FULL JSON COMPARE =====
    static matchJsonFile(actual: any, fileName: string) {
        const expected = Utils.loadResponsePayload(fileName);
        expect(actual).toStrictEqual(expected);
    }

    // ===== PARTIAL JSON (dot path) =====
    // static matchPartialJson(actual: any, partial: Record<string, any>) {
    //     for (const key in partial) {
    //         const actualValue = this.getValueByPath(actual, key);
    //         expect(actualValue).toEqual(partial[key]);
    //     }
    // }

    // ===== BODY CONTAINS TEXT =====
    static bodyContains(actual: any, text: string) {
        const json = JSON.stringify(actual);
        expect(json).toContain(text);
    }

    // ===== BODY CONTAINS JSON PATH VALUES =====
    // static containsJson(body: any, expected: Record<string, any>) {
    //     Object.entries(expected).forEach(([path, value]) => {
    //         const actual = this.getValueByPath(body, path);
    //         expect(actual).toEqual(value);
    //     });
    // }

    static containsJson(body: any, rows: TableRow[]) {
        rows.forEach(({ key, value }) => {
            const actual = this.getValueByPath(body, key);
            const expected = this.parseValue(value);
            expect(actual).toEqual(expected);
        });
    }

    // ===== ARRAY LENGTH =====
    static arrayLength(obj: any, path: string, expectedLength: number) {
        const arr = this.getValueByPath(obj, path);
        expect(Array.isArray(arr)).toBeTruthy();
        expect(arr.length).toBe(expectedLength);
    }

    static expectArrayLengthGreaterThan(body: any, path: string, minLength: number) {
        const arr = this.getValueByPath(body, path);
        expect(Array.isArray(arr)).toBeTruthy();
        expect(arr.length).toBeGreaterThan(minLength);
    }

    static expectArrayLengthLessThan(body: any, path: string, maxLength: number) {
        const arr = this.getValueByPath(body, path);
        expect(Array.isArray(arr)).toBeTruthy();
        expect(arr.length).toBeLessThan(maxLength);
    }
}
