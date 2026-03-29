import crypto from "crypto";
import { DateTimeUtils } from "./dateTimeUtils";

export class DynamicValueEngine {
    constructor(private context: Record<string, any> = {}) {}

    resolve(raw: any): any {
        if (typeof raw !== "string") return raw;

        // --- full match
        const exactMatch = raw.match(/^\{\{(.+?)\}\}$/);
        if (exactMatch) {
            return this.resolveExpression(exactMatch[1].trim());
        }

        // --- inline
        return raw.replace(/\{\{(.+?)\}\}/g, (_, key: string) => {
            const value = this.resolveExpression(key.trim());
            return String(value);
        });
    }

    private resolveExpression(key: string): any {
        // ---------- ENGINE {{$...}} ----------
        if (key.startsWith("$")) {
            return this.resolveEngine(key.slice(1));
        }

        // ---------- VARIABLE {{...}} ----------
        if (this.context[key] !== undefined) {
            return this.context[key];
        }

        throw new Error(`Variable '${key}' not found`);
    }

    private resolveEngine(key: string): any {
        // ===== EXACT MATCH =====
        switch (key) {
            case "uuid":
                return crypto.randomUUID();

            case "timestamp":
                return Date.now();

            case "now":
                return DateTimeUtils.currentDateTime();

            case "today":
                return DateTimeUtils.currentDate();

            case "yesterday":
                return DateTimeUtils.getDate("yesterday");

            case "tomorrow":
                return DateTimeUtils.getDate("tomorrow");

            case "nextMonth":
                return DateTimeUtils.getNextMonth();

            case "lastMonth":
                return DateTimeUtils.getLastMonth();

            case "currentMonth":
                return DateTimeUtils.getCurrentMonth();

            case "currentYear":
                return DateTimeUtils.currentYear();

            case "lastYear":
                return DateTimeUtils.getLastYear();

            case "nextYear":
                return DateTimeUtils.getNextYear();
        }

        // ===== PATTERN =====
        if (key.startsWith("now")) {
            return DateTimeUtils.parseDynamicDateTime(key);
        }

        throw new Error(`Engine function '${key}' not supported`);
    }
}
