import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('Generating examples...');

const examplesDir = path.join(ROOT_DIR, 'examples');

fs.readdirSync(examplesDir).forEach((dir) => {
  const fullPath = path.join(examplesDir, dir);
  const pkg = path.join(fullPath, 'package.json');

  if (fs.existsSync(pkg)) {
    const content = fs.readFileSync(pkg, 'utf-8');

    if (content.includes('openapi-ts')) {
      console.log('📦 Processing:', dir);

      execSync('pnpm run openapi-ts', {
        cwd: fullPath,
        stdio: 'inherit',
      });
    }
  }
});

console.log('✨ Done generating!');
