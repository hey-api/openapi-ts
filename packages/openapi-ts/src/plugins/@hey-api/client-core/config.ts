export const clientDefaultConfig = {
  baseUrl: true,
  bundle: true,
  exportFromIndex: false,
} as const;

export const clientDefaultMeta = {
  dependencies: ['@hey-api/typescript'],
  tags: ['client'],
} as const;
