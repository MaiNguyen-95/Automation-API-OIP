import fs from "fs";
import path from "path";
import { parseDynamicValue, setNestedValue } from "../../common/utils/dynamicUtils";
import { Utils } from "../../common/utils/utils";

type TableRow = { key: string; value: string };

export function buildPayload(options: { payloadName?: string; rows?: TableRow[]; resolve: (rawValue: string) => string }): Record<string, any> {
    let payload: Record<string, any> = {};
    // Load payload base
    if (options.payloadName) {
        payload = Utils.loadRequestPayload(options.payloadName);
        console.log("Base payload:", JSON.stringify(payload, null, 2));
    }

    // 2️⃣ no params table → return payload base
    if (!options.rows || options.rows.length === 0) {
        return payload;
    }

    // 3️⃣ Override payload from feature file table
    for (const row of options.rows) {
        const key = String(row.key || "").trim();
        if (!key) continue;

        const value = parseDynamicValue(row.value, options.resolve);
        setNestedValue(payload, key, value);
    }
    // ✅ Log payload cuối cùng
    console.log("🚀 Final payload:");
    console.log(JSON.stringify(payload, null, 2));
    return payload;
}
