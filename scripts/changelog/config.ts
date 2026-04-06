export type SemverType = 'major' | 'minor' | 'patch';

export const packageOrder = [
  '@hey-api/openapi-ts',
  '@hey-api/vite-plugin',
  '@hey-api/nuxt',
  '@hey-api/openapi-python',
  '@hey-api/custom-client',
  '@hey-api/json-schema-ref-parser',
  '@hey-api/codegen-core',
  '@hey-api/shared',
  '@hey-api/types',
  '@hey-api/spec-types',
] as const;

export type PackageName = (typeof packageOrder)[number];

export const sectionMap: Record<string, string> = {
  build: 'Core',
  cli: 'Core',
  config: 'Core',
  error: 'Core',
  input: 'Core',
  internal: 'Core',
  output: 'Core',
  parser: 'Core',
};

export const sectionPatterns: Array<[RegExp, string]> = [[/^plugin\(/, 'Plugins']];

export const sectionOrder = ['Breaking', 'Core', 'Plugins', 'Other'] as const;

export const breakingPatterns = [/^BREAKING[:\s]/i, /\bBREAKING CHANGE\b/i];

export const v0MinorBreakingSignals = [/removed/i, /renamed/i, /changed.*signature/i, /breaking/i];

export const semverFallback: Record<SemverType, string> = {
  major: 'Breaking',
  minor: 'Added',
  patch: 'Changed',
};

export const repo = 'hey-api/openapi-ts';
