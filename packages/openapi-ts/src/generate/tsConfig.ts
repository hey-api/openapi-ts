import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const findTsConfigPath = (
  tsConfigPath?: 'off' | (string & {}),
): string | null => {
  if (tsConfigPath === 'off') {
    return null;
  }

  if (tsConfigPath) {
    const resolved = path.isAbsolute(tsConfigPath)
      ? tsConfigPath
      : path.resolve(__dirname, tsConfigPath);
    return fs.existsSync(resolved) ? resolved : null;
  }

  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    const files = fs.readdirSync(dir);
    const candidates = files
      .filter((file) => file.startsWith('tsconfig') && file.endsWith('.json'))
      .sort((file) => (file === 'tsconfig.json' ? -1 : 1));

    if (candidates[0]) {
      return path.join(dir, candidates[0]);
    }

    dir = path.dirname(dir);
  }

  return null;
};

export const loadTsConfig = (
  configPath: string | null,
): ts.ParsedCommandLine | null => {
  if (!configPath) {
    return null;
  }

  const raw = ts.readConfigFile(configPath, ts.sys.readFile);

  if (raw.error) {
    throw new Error(`Couldn't read tsconfig from path: ${configPath}`);
  }

  return ts.parseJsonConfigFileContent(
    raw.config,
    ts.sys,
    path.dirname(configPath),
  );
};
