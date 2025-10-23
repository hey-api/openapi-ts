import type { Input } from '~/types/input';

// Regular expression to match ReadMe API Registry input formats:
//   - @{organization}/{project}#{uuid}
//   - {uuid}
const registryRegExp = /^(@([\w-]+)\/([\w\-.]+)#)?([\w-]+)$/;

/**
 * Creates a full ReadMe API Registry URL.
 *
 * @param uuid - ReadMe UUID
 * @returns The full ReadMe API registry URL.
 */
export const getRegistryUrl = (uuid: string): string =>
  `https://dash.readme.com/api/v1/api-registry/${uuid}`;

export interface Parsed {
  organization?: string;
  project?: string;
  uuid: string;
}

const namespace = 'readme';

/**
 * Parses a ReadMe input string and extracts components.
 *
 * @param shorthand - ReadMe format string (@org/project#uuid or uuid)
 * @returns Parsed ReadMe input components
 * @throws Error if the input format is invalid
 */
export const parseShorthand = (shorthand: string): Parsed => {
  const match = shorthand.match(registryRegExp);

  if (!match) {
    throw new Error(
      `Invalid ReadMe shorthand format. Expected "${namespace}:@organization/project#uuid" or "${namespace}:uuid", received: ${namespace}:${shorthand}`,
    );
  }

  const [, , organization, project, uuid] = match;

  if (!uuid) {
    throw new Error('The ReadMe UUID cannot be empty.');
  }

  const result: Parsed = {
    organization,
    project,
    uuid,
  };

  return result;
};

/**
 * Transforms a ReadMe shorthand string to the corresponding API URL.
 *
 * @param input - ReadMe format string
 * @returns The ReadMe API Registry URL
 */
export const inputToReadmePath = (input: string): Partial<Input> => {
  const shorthand = input.slice(`${namespace}:`.length);
  const parsed = parseShorthand(shorthand);
  return {
    ...parsed,
    path: getRegistryUrl(parsed.uuid),
    registry: 'readme',
  };
};
