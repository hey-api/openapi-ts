const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

console.log("Generating examples...");

const examplesDir = path.join(ROOT_DIR, "examples");

fs.readdirSync(examplesDir).forEach((dir) => {
  const fullPath = path.join(examplesDir, dir);
  const pkg = path.join(fullPath, "package.json");

  if (fs.existsSync(pkg)) {
    const content = fs.readFileSync(pkg, "utf-8");

    if (content.includes("openapi-ts")) {
      console.log("📦 Processing:", dir);
      execSync("pnpm run openapi-ts", {
        cwd: fullPath,
        stdio: "inherit",
      });
    }
  }
});

console.log("✨ Done generating!");