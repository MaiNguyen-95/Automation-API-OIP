import { expect } from "@playwright/test";
import { AxiosResponse } from "axios";

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

    // ===== STATUS CODE =====
    static statusCode(response: AxiosResponse, expected: number) {
        expect(response.status).toBe(expected);
    }

    // ===== FULL JSON COMPARE =====
    static jsonEqual(actual: any, expected: any) {
        expect(actual).toEqual(expected);
    }

    // ===== PARTIAL FLAT (dot path) =====
    static jsonContains(actual: any, partial: Record<string, any>) {
        for (const key in partial) {
            const actualValue = this.getValueByPath(actual, key);
            expect(actualValue).toEqual(partial[key]);
        }
    }

    // ===== DEEP NESTED OBJECT =====
    static jsonDeepContains(actual: any, expected: any) {
        const check = (act: any, exp: any) => {
            for (const key in exp) {
                if (typeof exp[key] === "object" && exp[key] !== null && !Array.isArray(exp[key])) {
                    check(act?.[key], exp[key]);
                } else {
                    expect(act?.[key]).toEqual(exp[key]);
                }
            }
        };

        check(actual, expected);
    }

    // ===== ARRAY LENGTH =====
    static arrayLength(obj: any, path: string, expectedLength: number) {
        const arr = this.getValueByPath(obj, path);
        expect(Array.isArray(arr)).toBeTruthy();
        expect(arr.length).toBe(expectedLength);
    }
}
