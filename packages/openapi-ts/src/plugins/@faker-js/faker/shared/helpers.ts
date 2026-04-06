/** Strip underscores/hyphens and lowercase for case-insensitive matching. */
export const normalizeName = (name: string) => name.replace(/[-_]/g, '').toLowerCase();
