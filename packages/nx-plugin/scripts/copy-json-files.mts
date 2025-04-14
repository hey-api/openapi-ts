import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to recursively create directories
function ensureDirectoryExists(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// Function to recursively copy JSON files from source to destination
function copyJsonFiles(sourceDir: string, targetDir: string) {
  // Read all files and directories in the source directory
  const items = readdirSync(sourceDir);

  for (const item of items) {
    const sourcePath = join(sourceDir, item);
    const targetPath = join(targetDir, item);

    const stats = statSync(sourcePath);

    if (stats.isDirectory()) {
      // Recursively copy JSON files from subdirectories
      copyJsonFiles(sourcePath, targetPath);
    } else if (stats.isFile() && extname(item).toLowerCase() === '.json') {
      // Copy JSON files
      ensureDirectoryExists(dirname(targetPath));
      copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${sourcePath} -> ${targetPath}`);
    }
  }
}

// Copy JSON files from src to dist
const sourceDir = resolve(__dirname, '../src');
const targetDir = resolve(__dirname, '../dist');

console.log('Copying JSON files from src to dist...');
copyJsonFiles(sourceDir, targetDir);
console.log('JSON files copying completed.');
