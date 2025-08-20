// Regular expression to match Hey API Registry input formats:

import type { Input } from '../../types/input';

//   - {organization}/{project}?{queryParams}
const registryRegExp = /^([\w-]+)\/([\w-]+)(?:\?([\w=&.-]*))?$/;

export const heyApiRegistryBaseUrl = 'https://get.heyapi.dev';

/**
 * Creates a full Hey API Registry URL.
 *
 * @param organization - Hey API organization slug
 * @param project - Hey API project slug
 * @param queryParams - Optional query parameters
 * @returns The full Hey API registry URL.
 */
export const getRegistryUrl = (
  organization: string,
  project: string,
  queryParams?: string,
): string =>
  `${heyApiRegistryBaseUrl}/${organization}/${project}${queryParams ? `?${queryParams}` : ''}`;

export interface Parsed {
  organization: string;
  project: string;
  queryParams?: string;
}

/**
 * Parses a Hey API input string and extracts components.
 *
 * @param input - Hey API configuration input
 * @returns Parsed Hey API input components
 * @throws Error if the input format is invalid
 */
export const parseShorthand = (
  input: Omit<Input, 'path'> & {
    path: string;
  },
): Parsed => {
  let organization = input.organization;
  let project = input.project;
  let queryParams: string | undefined;

  if (input.path) {
    const match = input.path.match(registryRegExp);

    if (!match) {
      throw new Error(
        `Invalid Hey API shorthand format. Expected "organization/project?queryParams" or "organization/project", received: ${input.path}`,
      );
    }

    organization = match[1];
    project = match[2];
    queryParams = match[3];
  }

  if (!organization) {
    throw new Error('The Hey API organization cannot be empty.');
  }

  if (!project) {
    throw new Error('The Hey API project cannot be empty.');
  }

  const result: Parsed = {
    organization,
    project,
    queryParams,
  };

  return result;
};

/**
 * Transforms a Hey API shorthand string to the corresponding API URL.
 *
 * @param input - Hey API configuration input
 * @returns The Hey API Registry URL
 */
export const inputToHeyApiPath = (
  input: Omit<Input, 'path'> & {
    path: string;
  },
): string => {
  const parsed = parseShorthand(input);
  return getRegistryUrl(
    parsed.organization,
    parsed.project,
    parsed.queryParams,
  );
};
