import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const PACKAGES_DIR = path.join(__dirname, '..', 'packages');

function readTemplates(): Record<string, string> {
  return Object.fromEntries(
    fs
      .readdirSync(TEMPLATES_DIR, { withFileTypes: true })
      .filter((entry) => !entry.isDirectory())
      .map((entry) => [
        path.parse(entry.name).name,
        fs.readFileSync(path.join(TEMPLATES_DIR, entry.name), 'utf-8'),
      ]),
  );
}

function replaceBetweenMarkers(content: string, templateContent: string, name: string): string {
  const startMarker = `<!-- template-${name}-start -->`;
  const endMarker = `<!-- template-${name}-end -->`;
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    return content;
  }

  return (
    content.slice(0, startIndex + startMarker.length) +
    `\n\n${templateContent}\n` +
    content.slice(endIndex)
  );
}

function readmeSync(): void {
  const templates = readTemplates();
  const packages = fs
    .readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  let updated = 0;

  for (const pkg of packages) {
    const readmePath = path.join(PACKAGES_DIR, pkg, 'README.md');
    let content: string;
    try {
      content = fs.readFileSync(readmePath, 'utf-8');
    } catch {
      continue;
    }

    let updatedContent = content;

    for (const [name, templateContent] of Object.entries(templates)) {
      updatedContent = replaceBetweenMarkers(updatedContent, templateContent, name);
    }

    if (updatedContent !== content) {
      fs.writeFileSync(readmePath, updatedContent);
      updated++;
    }
  }

  console.log(`✓ Synced ${updated} README file${updated !== 1 ? 's' : ''}`);
}

readmeSync();
