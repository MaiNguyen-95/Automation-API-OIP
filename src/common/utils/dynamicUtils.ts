// Utilities to parse values and set nested object paths

// Parse a string into a typed value with simple heuristics and placeholder resolution
export function parseDynamicValue(raw: string, resolve: (rawValue: string) => string): any {
    if (raw === undefined || raw === null) return raw;

    const resolved = resolve(String(raw));
    const trimmed = resolved.trim();

    if (trimmed.length === 0) return "";
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed === "null") return null;
    if (trimmed === "undefined") return undefined;

    // JSON object/array literal
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
            return JSON.parse(trimmed);
        } catch {
            // fallthrough
        }
    }

    // number (int/float)
    const number = Number(trimmed);
    if (!Number.isNaN(number) && trimmed !== "") return number;

    return resolved;
}

// Set value on object using dot and bracket notation (e.g. "user.profile.age" or "items[0].id")
export function setNestedValue(target: Record<string, any>, path: string, value: any): void {
    if (!path || path.trim() === "") {
        return;
    }

    // Parse path into segments (property names and array indices)
    const segments: (string | number)[] = [];
    const parts = path.split(".");

    for (const part of parts) {
        let remaining = part;
        while (remaining.length > 0) {
            const bracketStart = remaining.indexOf("[");
            if (bracketStart === -1) {
                // No bracket, entire remaining is property name
                if (remaining.length > 0) {
                    segments.push(remaining);
                }
                break;
            }

            // Extract property name before bracket
            if (bracketStart > 0) {
                segments.push(remaining.substring(0, bracketStart));
            }

            // Extract array index
            const bracketEnd = remaining.indexOf("]", bracketStart + 1);
            if (bracketEnd === -1) {
                // Invalid: no closing bracket, treat rest as property name
                segments.push(remaining.substring(bracketStart));
                break;
            }

            const indexStr = remaining.substring(bracketStart + 1, bracketEnd).trim();
            const indexNum = Number(indexStr);
            if (Number.isNaN(indexNum) || indexStr === "") {
                // Invalid index, treat as property name
                segments.push(remaining.substring(bracketStart, bracketEnd + 1));
            } else {
                segments.push(indexNum);
            }

            remaining = remaining.substring(bracketEnd + 1);
        }
    }

    // Navigate to target location and set value
    let cursor: any = target;
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const isLast = i === segments.length - 1;

        if (isLast) {
            cursor[segment] = value;
            return;
        }

        // Determine if next segment is array index
        const nextSegment = segments[i + 1];
        const shouldBeArray = typeof nextSegment === "number";

        // Create intermediate object/array if needed
        if (!(segment in cursor)) {
            cursor[segment] = shouldBeArray ? [] : {};
        } else {
            const existing = cursor[segment];
            // Ensure type matches expected structure
            if (shouldBeArray && !Array.isArray(existing)) {
                cursor[segment] = [];
            } else if (!shouldBeArray && (existing === null || typeof existing !== "object" || Array.isArray(existing))) {
                cursor[segment] = {};
            }
        }
        cursor = cursor[segment];
    }
}
