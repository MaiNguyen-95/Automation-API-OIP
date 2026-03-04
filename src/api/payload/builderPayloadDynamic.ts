import fs from "fs";
import path from "path";
import { parseDynamicValue, setNestedValue } from "../../common/utils/dynamicUtils";

type TableRow = { key: string; value: string };

export function buildPayload(options: { payloadName?: string; rows?: TableRow[]; resolve: (rawValue: string) => string }): Record<string, any> {
    let payload: Record<string, any> = {};
    // Load payload base
    if (options.payloadName) {
        const payloadPath = path.resolve(process.cwd(), "src", "data", "requestPayloads", `${options.payloadName}.json`);
        if (!fs.existsSync(payloadPath)) {
            throw new Error(`❌ Payload file not found: ${payloadPath}`);
        }
        const raw = fs.readFileSync(payloadPath, "utf-8");
        payload = JSON.parse(raw);
        //console.log("Base payload:", JSON.stringify(payload, null, 2));
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
