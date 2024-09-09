export const allowedServiceMethods = [
  'connect',
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
] as const;

/**
 * Convert the service version to 'normal' version.
 * This basically removes any "v" prefix from the version string.
 * @param version
 */
export function getServiceVersion(version = '1.0'): string {
  return String(version).replace(/^v/gi, '');
}
