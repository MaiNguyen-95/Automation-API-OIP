import fs from "node:fs";
import path from "node:path";

// ============================================================================
// CSV TOKEN READER
// Generic function to read token from any CSV file
// - Row 1: header (skipped)
// - Row 2: token value (first column)
// - csvPath: relative path from project root, passed in from step/feature
// ============================================================================

/**
 * Reads token from a CSV file at the given relative path
 * CSV file format:
 *   token
 *   eyJhbGciOiJSUzI1NiIsInR5cCI...
 *
 * @param csvPath - Relative path from project root (e.g. "../playwright-cucumber-ts/data/token.csv")
 * @returns token string from row 2
 * @throws Error if file does not exist or data is invalid
 */
export function getTokenFromCsv(csvPath: string): string {
    const resolvedPath = path.resolve(process.cwd(), csvPath);

    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`❌ Token CSV file not found at: ${resolvedPath}\n` + `   Provided path: ${csvPath}`);
    }

    const content = fs.readFileSync(resolvedPath, "utf-8");

    // Split by line, remove blank lines
    const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    // Need at least 2 rows: header + data
    if (lines.length < 2) {
        throw new Error(`❌ Token CSV file has insufficient data.\n` + `   Expected: row 1 = header, row 2 = token value\n` + `   Found: ${lines.length} non-empty row(s)`);
    }

    // Last row: take the most recently appended token
    const tokenRow = lines[lines.length - 1];
    const token = tokenRow.split(",")[0].trim();

    if (!token) {
        throw new Error(`❌ Token value is empty at row 2 in: ${resolvedPath}`);
    }

    console.log(`✅ Token loaded from CSV: ${resolvedPath}`);
    return token;
}

/**
 * Returns Authorization header with token read from CSV at the given path
 *
 * @param csvPath - Relative path from project root
 * @returns { Authorization: "Bearer <token>" }
 */
export function getCsvTokenHeader(csvPath: string): Record<string, string> {
    const token = getTokenFromCsv(csvPath);
    return { Authorization: `Bearer ${token}` };
}
