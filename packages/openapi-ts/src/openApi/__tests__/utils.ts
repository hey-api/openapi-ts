import fs from 'node:fs';
import path from 'node:path';

import yaml from 'yaml';

export const specFileToJson = (file: string) => {
  const raw = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file).toLowerCase();
  return ext === '.json' ? JSON.parse(raw) : yaml.parse(raw);
};
