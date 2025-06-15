export const clientDefaultConfig = {
  baseUrl: true,
  bundle: true,
  exportFromIndex: false,
} as const;

export const clientDefaultMeta = {
  _dependencies: ['@hey-api/typescript'],
  _handlerLegacy: () => {},
  _tags: ['client'],
  output: 'client',
} as const;
