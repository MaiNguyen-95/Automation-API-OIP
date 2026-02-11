type TableRow = { key: string; value: string };

export function buildHeadersDynamic(rows: TableRow[], resolve: (rawValue: string) => string): Record<string, string> {
    const headers: Record<string, string> = {};
    for (const row of rows) {
        const key = String(row.key || "").trim();
        if (!key) continue;
        const value = resolve(row.value ?? "");
        headers[key.toLowerCase()] = value;
    }
    if (!headers["content-type"]) {
        headers["content-type"] = "application/json";
    }
    return headers;
}
