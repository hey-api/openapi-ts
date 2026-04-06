/** Strip underscores/hyphens and lowercase for case-insensitive matching. */
export const normalizeName = (name: string) => name.replace(/[-_]/g, '').toLowerCase();

export const getFakerPackagePath = (maybeLocale: string | undefined) =>
  maybeLocale ? `@faker-js/faker/locale/${maybeLocale}` : '@faker-js/faker';
