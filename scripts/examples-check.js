const { execSync } = require("child_process");

console.log("🔍 Checking examples...");

execSync("node scripts/examples-generate.js", { stdio: "inherit" });

console.log("✨ Check complete!");