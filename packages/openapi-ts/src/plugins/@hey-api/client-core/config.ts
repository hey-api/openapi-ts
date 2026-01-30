export const clientDefaultConfig = {
  baseUrl: true,
  bundle: true,
  includeInEntry: false,
} as const;

export const clientDefaultMeta = {
  dependencies: ['@hey-api/typescript'],
  tags: ['client'],
} as const;
