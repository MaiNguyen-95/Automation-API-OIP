export class DateTimeUtils {
    // ===== FORMAT =====
    private static format(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    private static formatDateTime(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        const hh = String(date.getHours()).padStart(2, "0");
        const mi = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    // ===== Current =====
    static currentDateTime(): string {
        const d = new Date();
        return this.formatDateTime(d); // YYYY-MM-DD HH:mm:ss
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

    static addDaysWithTime(days: number): string {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return this.formatDateTime(d);
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

    // ===== YEAR OPERATIONS =====
    private static shiftYear(offset: number): Date {
        const d = new Date();
        d.setFullYear(d.getFullYear() + offset);
        return d;
    }

    static getNextYear(): string {
        return String(this.shiftYear(1).getFullYear());
    }

    static getLastYear(): string {
        return String(this.shiftYear(-1).getFullYear());
    }

    // ===== MAIN PARSE =====
    static parseDynamicDateTime(input: string): string {
        const { expr, tz } = this.extractTimezone(input);

        if (!expr.startsWith("now")) {
            throw new Error(`Invalid expression: ${expr}`);
        }

        let date = new Date();

        // apply offset (local time)
        date = this.applyOffsetLocal(date, expr);

        // 👉 có timezone → format ISO + TZ
        if (tz) {
            return this.formatISOWithTZ(date, tz);
        }

        // 👉 không TZ → local datetime
        return this.formatDateTime(date);
    }

    // ===== EXTRACT TZ (FIXED) =====
    private static extractTimezone(input: string): { expr: string; tz?: string } {
        const trimmed = input.trim();

        const match = trimmed.match(/(now(?:[+-]\d+[yMdhms])*)([+-]\d{2}:\d{2})$/);

        if (match) {
            return {
                expr: match[1],
                tz: match[2],
            };
        }

        return { expr: trimmed };
    }

    // ===== APPLY OFFSET =====
    private static applyOffsetLocal(date: Date, expr: string): Date {
        const regex = /([+-]\d+)([yMdhms])/g;
        let match;

        while ((match = regex.exec(expr)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case "y":
                    date.setFullYear(date.getFullYear() + value);
                    break;
                case "M":
                    date.setMonth(date.getMonth() + value);
                    break;
                case "d":
                    date.setDate(date.getDate() + value);
                    break;
                case "h":
                    date.setHours(date.getHours() + value);
                    break;
                case "m":
                    date.setMinutes(date.getMinutes() + value);
                    break;
                case "s":
                    date.setSeconds(date.getSeconds() + value);
                    break;
            }
        }

        return date;
    }

    // ===== FORMAT ISO WITH TZ =====
    private static formatISOWithTZ(date: Date, tz: string): string {
        const offsetMinutes = this.parseOffset(tz);

        // convert local → UTC → target TZ
        const utcTime = date.getTime() - date.getTimezoneOffset() * 60000;
        const target = new Date(utcTime + offsetMinutes * 60000);

        const yyyy = target.getUTCFullYear();
        const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(target.getUTCDate()).padStart(2, "0");

        const hh = String(target.getUTCHours()).padStart(2, "0");
        const mi = String(target.getUTCMinutes()).padStart(2, "0");
        const ss = String(target.getUTCSeconds()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${tz}`;
    }

    private static parseOffset(tz: string): number {
        const sign = tz.startsWith("-") ? -1 : 1;
        const [h, m] = tz.replace("+", "").replace("-", "").split(":").map(Number);
        return sign * (h * 60 + m);
    }
}
