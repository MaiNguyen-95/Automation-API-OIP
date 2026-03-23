import * as fs from 'fs';
import * as path from 'path';

// Define paths relative to the src folder
const csvPath = path.resolve(__dirname, "../data/csvData/tokenFCID.csv");
const baseFeaturePath = path.resolve(__dirname, "../features/orderApis/supportGetOrderIDCodeB2CFlow.feature");
const featureOutputPath = path.resolve(__dirname, "../features/orderApis/supportGetOrderIDCodeB2CFlow_generated.feature");

if (!fs.existsSync(csvPath)) {
    console.error(`[ERROR] Cannot generate Feature file! CSV file not found at ${csvPath}`);
    process.exit(1);
}

if (!fs.existsSync(baseFeaturePath)) {
    console.error(`[ERROR] Base Feature file not found at ${baseFeaturePath}`);
    process.exit(1);
}

// 1. Read base Feature File
const baseContent = fs.readFileSync(baseFeaturePath, "utf-8");

// Slice the feature file right before the custom "Examples:" block or the dummy tokens
let coreFeatureText = baseContent;
const examplesMatch = baseContent.match(/Examples:\s*\n/i);

if (examplesMatch && examplesMatch.index !== undefined) {
    // Keep everything up to "Examples:\n"
    coreFeatureText = baseContent.substring(0, examplesMatch.index + examplesMatch[0].length);
} else {
    // If there is no Examples block yet, append one
    coreFeatureText += `\n    Examples:\n`;
}

// 2. Read all tokens from the CSV file
const csvContent = fs.readFileSync(csvPath, "utf-8");
const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== "");

const headers = lines[0].split(",");
let tokenIndex = headers.indexOf("token");

if (tokenIndex === -1 && lines.length > 0 && lines[0].length > 10) { 
    tokenIndex = 0; 
} else if (tokenIndex === -1) {
    console.error(`[ERROR] CSV first row missing 'token' column header! (found: ${lines[0]})`);
    process.exit(1);
}

// 3. Build 'Examples' rows dynamically
// We only need the 'token' column now since you hardcoded the rest in the feature itself!
let examplesText = `        | token |\n`;

const startIndex = (lines[0].includes("token")) ? 1 : 0;
let tokenCount = 0;

for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const tokenVal = cols[tokenIndex]?.trim() || "";
    if (tokenVal) {
        examplesText += `        | ${tokenVal} |\n`;
        tokenCount++;
    }
}

// 4. Combine Base + Generated Rows
const finalFeatureTemplate = coreFeatureText + examplesText;

// 5. Output
const outDir = path.dirname(featureOutputPath);
if (!fs.existsSync(outDir)){
    fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(featureOutputPath, finalFeatureTemplate, "utf-8");
console.log(`[SUCCESS] Feature generated at: ${featureOutputPath}`);
console.log(`[SUCCESS] Registered ${tokenCount} scenario cycles from CSV using your custom feature code!`);
