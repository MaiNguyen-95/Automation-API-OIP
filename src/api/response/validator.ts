import Ajv from "ajv";
import path from "node:path";
import fs from "node:fs";

// ============================================================================
// CONFIGURATION
// ============================================================================

// Cache compiled schemas (reuse compiled validators)
const compiledCache: Record<string, any> = {};

// Single Ajv instance (singleton pattern for performance)
let ajvInstance: any;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get or create Ajv instance (singleton pattern)
 */
function getAjv(): any {
    if (ajvInstance) return ajvInstance;
    ajvInstance = new Ajv({ allErrors: true });

    // Add format validators if ajv-formats is available
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const addFormats = require("ajv-formats");
        if (typeof addFormats === "function") {
            addFormats(ajvInstance);
        }
    } catch {
        // ajv-formats not installed, continue without it
    }

    return ajvInstance;
}

/**
 * Format Ajv validation errors into readable string
 */
function formatAjvErrors(errors: any[] | null | undefined): string {
    if (!errors || errors.length === 0) return "";

    return errors
        .map((e) => {
            const path = e?.instancePath || e?.dataPath || e?.schemaPath || "";
            const message = e?.message || "validation error";
            const params = e?.params ? JSON.stringify(e.params) : "";
            return `- ${path} ${message} ${params}`.trim();
        })
        .join("\n");
}

/**
 * Load JSON schema from file
 */
function loadSchemaByName(schemaName: string): any {
    const baseDir = path.resolve(__dirname, "../response/schemas");
    const filePath = path.join(baseDir, `${schemaName}.json`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`Schema file not found: ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Validate data against a JSON schema
 *
 * @param schemaName - Name of schema file (without .json extension)
 * @param data - Data to validate
 * @returns Validation result with error text if invalid
 */
function validateWithSchema(schemaName: string, data: any): { valid: boolean; errorText?: string } {
    // Get or compile validator
    let validate = compiledCache[schemaName];
    if (!validate) {
        const schema = loadSchemaByName(schemaName);
        const ajv = getAjv();
        validate = ajv.compile(schema);
        compiledCache[schemaName] = validate; // Cache for reuse
    }

    // Validate data
    const valid = validate(data);

    if (!valid) {
        return { valid: false, errorText: formatAjvErrors(validate.errors) };
    }

    return { valid: true };
}

/**
 * Assert data matches schema (throw error if invalid)
 */
export function assertSchema(schemaName: string, data: any): void {
    const result = validateWithSchema(schemaName, data);

    if (!result.valid) {
        throw new Error(`Schema '${schemaName}' validation failed:\n${result.errorText}`);
    }
}
