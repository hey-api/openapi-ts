import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('commitlint configuration', () => {
  it('commitlint config file exists', () => {
    const configPath = path.join(process.cwd(), 'commitlint.config.js');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it('commit-msg hook exists and is executable', () => {
    const hookPath = path.join(process.cwd(), '.husky', 'commit-msg');
    expect(fs.existsSync(hookPath)).toBe(true);

    const stats = fs.statSync(hookPath);
    // Check if file is executable (using bitwise AND with octal permission)
    expect(stats.mode & parseInt('111', 8)).toBeGreaterThan(0);
  });

  it('commitlint is in package.json dependencies', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    expect(packageJson.devDependencies['@commitlint/cli']).toBeDefined();
    expect(
      packageJson.devDependencies['@commitlint/config-conventional'],
    ).toBeDefined();
  });

  it('commitlint script is in package.json', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    expect(packageJson.scripts.commitlint).toBe('commitlint --edit');
  });
});
