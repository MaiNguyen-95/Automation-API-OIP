import { Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import * as fs from "fs";
import * as path from "path";

/**
 * Helper to update a single token's row in a simple CSV format.
 * This handles CSV files generated manually or by scripts,
 * appending columns (orderId, couponCode) if they do not exist.
 */
function updateCsvLocally(filePath: string, tokenVal: string, orderId: string, coupon: string) {
    if (!fs.existsSync(filePath)) {
        console.error(`CSV file not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
    
    // Check headers
    let headers = lines[0].split(",");
    
    // Make sure we have the required header columns
    if (!headers.includes("orderId")) headers.push("orderId");
    if (!headers.includes("couponCode")) headers.push("couponCode");
    
    const tokenIndex = headers.indexOf("token"); // Assumes 'token' is a column
    const orderIndex = headers.indexOf("orderId");
    const couponIndex = headers.indexOf("couponCode");

    if (tokenIndex === -1) {
        console.error(`CSV must contain 'token' header but found: ${lines[0]}`);
        return;
    }

    let updated = false;

    // We start from 1 to skip header
    const newLines = lines.map((line, index) => {
        if (index === 0) {
            return headers.join(",");
        }
        
        const cols = line.split(",");
        
        // Ensure the row has enough columns corresponding to headers
        while (cols.length < headers.length) {
            cols.push(""); // pad empty spaces
        }

        // If this row's token matches our active token
        if (cols[tokenIndex].trim() === tokenVal) {
            cols[orderIndex] = orderId;
            cols[couponIndex] = coupon;
            updated = true;
        }

        return cols.join(",");
    });

    if (updated) {
        // Only write if we found the token and mutated it
        fs.writeFileSync(filePath, newLines.join("\n"));
        console.log(`[CSV Logger] Updated orderId=${orderId} & couponCode=${coupon} for token "${tokenVal}".`);
    } else {
        console.log(`[CSV Logger] Token "${tokenVal}" not found in CSV. No changes made.`);
    }
}

Then(
    "I save {string} and {string} back to CSV {string} for token {string}",
    async function (this: CustomWorld, varOrder: string, varCoupon: string, csvRelativePath: string, tokenVal: string) {
        // 1. Get extracted data from CustomWorld instance
        const orderIdValue = this.dynamicValues?.[varOrder] || "FAILED_OR_EMPTY";
        const couponCodeValue = this.dynamicValues?.[varCoupon] || "FAILED_OR_EMPTY";

        // 2. Resolve absolute path in case framework is run from a nested folder
        const absolutePath = path.resolve(process.cwd(), csvRelativePath);
        
        // 3. Update File
        updateCsvLocally(absolutePath, tokenVal, orderIdValue, couponCodeValue);
    }
);
