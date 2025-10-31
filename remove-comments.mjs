import path from "path";
import { promises as fs } from "fs";
import ts from "typescript";
const projectRoot = process.cwd();
const scriptKindByExtension = new Map([
    [".ts", ts.ScriptKind.TS],
    [".tsx", ts.ScriptKind.TSX],
    [".js", ts.ScriptKind.JS],
    [".jsx", ts.ScriptKind.JSX],
    [".mjs", ts.ScriptKind.JS],
    [".cjs", ts.ScriptKind.JS],
]);
const ignoredDirectories = new Set([
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    ".turbo",
    ".vercel",
]);
const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed,
});
async function collectFiles(dir, results) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith(".")) {
            if (entry.isDirectory()) {
                continue;
            }
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (ignoredDirectories.has(entry.name)) {
                continue;
            }
            await collectFiles(fullPath, results);
        }
        else {
            const ext = path.extname(entry.name).toLowerCase();
            if (scriptKindByExtension.has(ext)) {
                results.push(fullPath);
            }
        }
    }
}
async function stripComments(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const scriptKind = scriptKindByExtension.get(ext);
    if (!scriptKind) {
        return false;
    }
    const original = await fs.readFile(filePath, "utf8");
    const sourceFile = ts.createSourceFile(filePath, original, ts.ScriptTarget.Latest, true, scriptKind);
    const updated = printer.printFile(sourceFile);
    if (updated !== original) {
        await fs.writeFile(filePath, updated, "utf8");
        return true;
    }
    return false;
}
async function main() {
    const files = [];
    await collectFiles(projectRoot, files);
    let updatedCount = 0;
    for (const filePath of files) {
        const changed = await stripComments(filePath);
        if (changed) {
            updatedCount += 1;
            console.log(`Stripped comments: ${path.relative(projectRoot, filePath)}`);
        }
    }
    console.log(`Comment removal complete. Processed ${files.length} files, stripped comments from ${updatedCount} files.`);
}
main().catch((error) => {
    console.error("Failed to remove comments:", error);
    process.exit(1);
});
