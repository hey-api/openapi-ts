// Regular expression to match ReadMe input formats:
// readme:@organization/project#uuid or readme:uuid
const readmeInputRegExp = /^readme:(?:@([\w-]+)\/([\w-]+)#)?([\w-]+)$/;

export interface ReadmeInput {
  organization?: string;
  project?: string;
  uuid: string;
}

/**
 * Checks if the input string is a ReadMe format
 * @param input - The input string to check
 * @returns true if the input matches ReadMe format patterns
 */
export const isReadmeInput = (input: string): boolean =>
  typeof input === 'string' && input.startsWith('readme:');

/**
 * Parses a ReadMe input string and extracts components
 * @param input - ReadMe format string (readme:@org/project#uuid or readme:uuid)
 * @returns Parsed ReadMe input components
 * @throws Error if the input format is invalid
 */
export const parseReadmeInput = (input: string): ReadmeInput => {
  if (!isReadmeInput(input)) {
    throw new Error(
      `Invalid ReadMe input format. Expected "readme:@organization/project#uuid" or "readme:uuid", received: ${input}`,
    );
  }

  const match = input.match(readmeInputRegExp);

  if (!match) {
    throw new Error(
      `Invalid ReadMe input format. Expected "readme:@organization/project#uuid" or "readme:uuid", received: ${input}`,
    );
  }

  const [, organization, project, uuid] = match;

  // Validate UUID format (basic validation for alphanumeric + hyphens)
  if (!uuid || !/^[\w-]+$/.test(uuid)) {
    throw new Error(`Invalid UUID format: ${uuid}`);
  }

  const result: ReadmeInput = { uuid };

  if (organization && project) {
    result.organization = organization;
    result.project = project;
  }

  return result;
};

/**
 * Generates the ReadMe API Registry URL for a given UUID
 * @param uuid - The ReadMe API Registry UUID
 * @returns The full API URL
 */
export const getReadmeApiUrl = (uuid: string): string =>
  `https://dash.readme.com/api/v1/api-registry/${uuid}`;

/**
 * Transforms a ReadMe input string to the corresponding API URL
 * @param input - ReadMe format string
 * @returns The ReadMe API Registry URL
 */
export const transformReadmeInput = (input: string): string => {
  const parsed = parseReadmeInput(input);
  return getReadmeApiUrl(parsed.uuid);
};
