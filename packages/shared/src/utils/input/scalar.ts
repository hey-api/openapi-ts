import type { Input } from '../../config/input/types';

// Regular expression to match Scalar API Registry input formats:
//   - @{organization}/{project}
const registryRegExp = /^(@[\w-]+)\/([\w.-]+)$/;

/**
 * Creates a full Scalar API Registry URL.
 *
 * @param organization - Scalar organization slug
 * @param project - Scalar project slug
 * @returns The full Scalar API registry URL.
 */
export function getRegistryUrl(organization: string, project: string): string {
  return `https://registry.scalar.com/${organization}/apis/${project}/latest?format=json`;
}

export type Parsed = {
  organization: string;
  project: string;
};

const namespace = 'scalar';

/**
 * Parses a Scalar input string and extracts components.
 *
 * @param shorthand - Scalar format string (@org/project)
 * @returns Parsed Scalar input components
 * @throws Error if the input format is invalid
 */
export function parseShorthand(shorthand: string): Parsed {
  const match = shorthand.match(registryRegExp);

  if (!match) {
    throw new Error(
      `Invalid Scalar shorthand format. Expected "${namespace}:@organization/project", received: ${namespace}:${shorthand}`,
    );
  }

  const [, organization, project] = match;

  if (!organization) {
    throw new Error('The Scalar organization cannot be empty.');
  }

  if (!project) {
    throw new Error('The Scalar project cannot be empty.');
  }

  const result: Parsed = {
    organization,
    project,
  };

  return result;
}

/**
 * Transforms a Scalar shorthand string to the corresponding API URL.
 *
 * @param input - Scalar format string
 * @returns The Scalar API Registry URL
 */
export function inputToScalarPath(input: string): Partial<Input> {
  const shorthand = input.slice(`${namespace}:`.length);
  const parsed = parseShorthand(shorthand);
  return {
    ...parsed,
    path: getRegistryUrl(parsed.organization, parsed.project),
    registry: 'scalar',
  };
}
