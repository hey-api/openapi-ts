import colors from 'ansi-colors';

import type { Input } from './types';

export function compileInputPath(input: Omit<Input, 'watch'>) {
  const result: Pick<
    Partial<Input>,
    | 'api_key'
    | 'branch'
    | 'commit_sha'
    | 'organization'
    | 'project'
    | 'registry'
    | 'tags'
    | 'version'
  > &
    Pick<Input, 'path'> = {
    ...input,
    path: '',
  };

  if (
    input.path &&
    (typeof input.path !== 'string' || input.registry !== 'hey-api')
  ) {
    result.path = input.path;
    return result;
  }

  const [basePath, baseQuery] = input.path.split('?');
  const queryParts = (baseQuery || '').split('&');
  const queryPath = queryParts.map((part) => part.split('='));

  let path = basePath || '';
  if (path.endsWith('/')) {
    path = path.slice(0, path.length - 1);
  }

  const [, pathUrl] = path.split('://');
  const [baseUrl, organization, project] = (pathUrl || '').split('/');
  result.organization = organization || input.organization;
  result.project = project || input.project;

  const queryParams: Array<string> = [];

  const kApiKey = 'api_key';
  result.api_key =
    queryPath.find(([key]) => key === kApiKey)?.[1] ||
    input.api_key ||
    process.env.HEY_API_TOKEN;
  if (result.api_key) {
    queryParams.push(`${kApiKey}=${result.api_key}`);
  }

  const kBranch = 'branch';
  result.branch =
    queryPath.find(([key]) => key === kBranch)?.[1] || input.branch;
  if (result.branch) {
    queryParams.push(`${kBranch}=${result.branch}`);
  }

  const kCommitSha = 'commit_sha';
  result.commit_sha =
    queryPath.find(([key]) => key === kCommitSha)?.[1] || input.commit_sha;
  if (result.commit_sha) {
    queryParams.push(`${kCommitSha}=${result.commit_sha}`);
  }

  const kTags = 'tags';
  result.tags =
    queryPath.find(([key]) => key === kTags)?.[1]?.split(',') || input.tags;
  if (result.tags?.length) {
    queryParams.push(`${kTags}=${result.tags.join(',')}`);
  }

  const kVersion = 'version';
  result.version =
    queryPath.find(([key]) => key === kVersion)?.[1] || input.version;
  if (result.version) {
    queryParams.push(`${kVersion}=${result.version}`);
  }

  if (!result.organization) {
    throw new Error(
      'missing organization - from which Hey API Platform organization do you want to generate your output?',
    );
  }

  if (!result.project) {
    throw new Error(
      'missing project - from which Hey API Platform project do you want to generate your output?',
    );
  }

  const query = queryParams.join('&');
  const platformUrl = baseUrl || 'get.heyapi.dev';
  const isLocalhost = platformUrl.startsWith('localhost');
  const platformUrlWithProtocol = [
    isLocalhost ? 'http' : 'https',
    platformUrl,
  ].join('://');
  const compiledPath = isLocalhost
    ? [
        platformUrlWithProtocol,
        'v1',
        'get',
        result.organization,
        result.project,
      ].join('/')
    : [platformUrlWithProtocol, result.organization, result.project].join('/');
  result.path = query ? `${compiledPath}?${query}` : compiledPath;

  return result;
}

export function logInputPaths(
  inputPaths: ReadonlyArray<ReturnType<typeof compileInputPath>>,
  jobIndex: number,
): void {
  const lines: Array<string> = [];

  const jobPrefix = colors.gray(`[Job ${jobIndex + 1}] `);
  const count = inputPaths.length;
  const baseString = colors.cyan(
    `Generating from ${count} ${count === 1 ? 'input' : 'inputs'}:`,
  );
  lines.push(`${jobPrefix}⏳ ${baseString}`);

  inputPaths.forEach((inputPath, index) => {
    const itemPrefixStr = `  [${index + 1}] `;
    const itemPrefix = colors.cyan(itemPrefixStr);
    const detailIndent = ' '.repeat(itemPrefixStr.length);

    if (typeof inputPath.path !== 'string') {
      lines.push(`${jobPrefix}${itemPrefix}raw OpenAPI specification`);
      return;
    }

    switch (inputPath.registry) {
      case 'hey-api': {
        const baseInput = [inputPath.organization, inputPath.project]
          .filter(Boolean)
          .join('/');
        lines.push(`${jobPrefix}${itemPrefix}${baseInput}`);
        if (inputPath.branch) {
          lines.push(
            `${jobPrefix}${detailIndent}${colors.gray('branch:')} ${colors.green(
              inputPath.branch,
            )}`,
          );
        }
        if (inputPath.commit_sha) {
          lines.push(
            `${jobPrefix}${detailIndent}${colors.gray('commit:')} ${colors.green(
              inputPath.commit_sha,
            )}`,
          );
        }
        if (inputPath.tags?.length) {
          lines.push(
            `${jobPrefix}${detailIndent}${colors.gray('tags:')} ${colors.green(
              inputPath.tags.join(', '),
            )}`,
          );
        }
        if (inputPath.version) {
          lines.push(
            `${jobPrefix}${detailIndent}${colors.gray('version:')} ${colors.green(
              inputPath.version,
            )}`,
          );
        }
        lines.push(
          `${jobPrefix}${detailIndent}${colors.gray('registry:')} ${colors.green('Hey API')}`,
        );
        break;
      }
      case 'readme': {
        const baseInput = [inputPath.organization, inputPath.project]
          .filter(Boolean)
          .join('/');
        if (!baseInput) {
          lines.push(`${jobPrefix}${itemPrefix}${inputPath.path}`);
        } else {
          lines.push(`${jobPrefix}${itemPrefix}${baseInput}`);
        }
        // @ts-expect-error
        if (inputPath.uuid) {
          lines.push(
            `${jobPrefix}${detailIndent}${colors.gray('uuid:')} ${colors.green(
              // @ts-expect-error
              inputPath.uuid,
            )}`,
          );
        }
        lines.push(
          `${jobPrefix}${detailIndent}${colors.gray('registry:')} ${colors.green('ReadMe')}`,
        );
        break;
      }
      case 'scalar': {
        const baseInput = [inputPath.organization, inputPath.project]
          .filter(Boolean)
          .join('/');
        lines.push(`${jobPrefix}${itemPrefix}${baseInput}`);
        lines.push(
          `${jobPrefix}${detailIndent}${colors.gray('registry:')} ${colors.green('Scalar')}`,
        );
        break;
      }
      default:
        lines.push(`${jobPrefix}${itemPrefix}${inputPath.path}`);
        break;
    }
  });

  for (const line of lines) {
    console.log(line);
  }
}
