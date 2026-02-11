import { parseDynamicValue } from "../../common/utils/dynamicUtils";

type TableRow = { key: string; value: string };

export function buildQueryFromTable(rows: TableRow[], resolve: (rawValue: string) => string): Record<string, any> {
    const query: Record<string, any> = {};
    for (const row of rows) {
        const key = String(row.key || "").trim();
        if (!key) continue;
        query[key] = parseDynamicValue(row.value, resolve);
    }
    return query;
}
