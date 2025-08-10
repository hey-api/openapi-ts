import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Recursively creates a directory if it does not exist.
 * @param {string} dirPath
 */
function ensureDirectoryExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 *
 * @param {string} src
 * @param {string} dest
 */
function copyRecursive(src, dest) {
  const stat = statSync(src);

  if (stat.isDirectory()) {
    // Create the destination directory if it doesn't exist
    mkdirSync(dest, { recursive: true });

    // Read contents of the source directory
    const entries = readdirSync(src);

    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      copyRecursive(srcPath, destPath);
    }
  } else {
    // It's a file, copy it
    copyFileSync(src, dest);
  }
}

/**
 * Recursively copies JSON files from a source directory to a target directory.
 * @param {string} sourceDir
 * @param {string} targetDir
 */
function copyJsonFiles(sourceDir, targetDir) {
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

// copy the template folders and all contents from the src/generators/openapi-client to dist
const generatorFoldersToCopy = ['files', 'options', 'plugins', 'tests'];

function copyGeneratorFolders() {
  const sourceDir = resolve(__dirname, '../src/generators/openapi-client');
  const targetDir = resolve(__dirname, '../dist');

  for (const folder of generatorFoldersToCopy) {
    const sourceFolder = join(sourceDir, folder);
    const destinationFolder = join(targetDir, folder);

    // copy the folder and all contents
    copyRecursive(sourceFolder, destinationFolder);
  }
}

copyGeneratorFolders();
