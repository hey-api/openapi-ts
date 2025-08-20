import path from 'node:path';

import colors from 'ansi-colors';

import { generateLegacyOutput } from './generate/legacy/output';
import { generateOutput } from './generate/output';
import { getSpec } from './getSpec';
import type { IR } from './ir/types';
import { parseLegacy, parseOpenApiSpec } from './openApi';
import { patchOpenApiSpec } from './openApi/shared/utils/patch';
import { processOutput } from './processOutput';
import type { Client } from './types/client';
import type { Config } from './types/config';
import type { WatchValues } from './types/types';
import { isLegacyClient, legacyNameFromConfig } from './utils/config';
import type { Templates } from './utils/handlebars';
import { heyApiRegistryBaseUrl } from './utils/input/heyApi';
import type { Logger } from './utils/logger';
import { postProcessClient } from './utils/postprocess';

const isHeyApiRegistryPath = (path: string) =>
  path.startsWith(heyApiRegistryBaseUrl);
// || path.startsWith('http://localhost:4000')

export const compileInputPath = (input: Omit<Config['input'], 'watch'>) => {
  const result: Pick<
    Partial<Config['input']>,
    | 'api_key'
    | 'branch'
    | 'commit_sha'
    | 'organization'
    | 'project'
    | 'tags'
    | 'version'
  > &
    Pick<Required<Config['input']>, 'path'> = {
    path: '',
  };

  if (
    input.path &&
    (typeof input.path !== 'string' || !isHeyApiRegistryPath(input.path))
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
};

const logInputPath = (inputPath: ReturnType<typeof compileInputPath>) => {
  const baseString = colors.cyan('Generating from');

  if (typeof inputPath.path === 'string') {
    const baseInput = isHeyApiRegistryPath(inputPath.path)
      ? `${inputPath.organization ?? ''}/${inputPath.project ?? ''}`
      : inputPath.path;
    console.log(`⏳ ${baseString} ${baseInput}`);
    if (isHeyApiRegistryPath(inputPath.path)) {
      if (inputPath.branch) {
        console.log(
          `${colors.gray('branch:')} ${colors.green(inputPath.branch)}`,
        );
      }
      if (inputPath.commit_sha) {
        console.log(
          `${colors.gray('commit:')} ${colors.green(inputPath.commit_sha)}`,
        );
      }
      if (inputPath.tags?.length) {
        console.log(
          `${colors.gray('tags:')} ${colors.green(inputPath.tags.join(', '))}`,
        );
      }
      if (inputPath.version) {
        console.log(
          `${colors.gray('version:')} ${colors.green(inputPath.version)}`,
        );
      }
    }
  } else {
    console.log(`⏳ ${baseString} raw OpenAPI specification`);
  }
};

export const createClient = async ({
  config,
  dependencies,
  logger,
  templates,
  watch: _watch,
}: {
  config: Config;
  dependencies: Record<string, string>;
  logger: Logger;
  templates: Templates;
  /**
   * Always falsy on the first run, truthy on subsequent runs.
   */
  watch?: WatchValues;
}) => {
  const inputPath = compileInputPath(config.input);
  const { timeout } = config.input.watch;

  const watch: WatchValues = _watch || { headers: new Headers() };

  // on first run, print the message as soon as possible
  if (config.logs.level !== 'silent' && !_watch) {
    logInputPath(inputPath);
  }

  const eventSpec = logger.timeEvent('spec');
  const { data, error, response } = await getSpec({
    fetchOptions: config.input.fetch,
    inputPath: inputPath.path,
    timeout,
    watch,
  });
  eventSpec.timeEnd();

  // throw on first run if there's an error to preserve user experience
  // if in watch mode, subsequent errors won't throw to gracefully handle
  // cases where server might be reloading
  if (error && !_watch) {
    throw new Error(
      `Request failed with status ${response.status}: ${response.statusText}`,
    );
  }

  let client: Client | undefined;
  let context: IR.Context | undefined;

  if (data) {
    // on subsequent runs in watch mode, print the mssage only if we know we're
    // generating the output
    if (config.logs.level !== 'silent' && _watch) {
      console.clear();
      logInputPath(inputPath);
    }

    const eventInputPatch = logger.timeEvent('input.patch');
    patchOpenApiSpec({ patchOptions: config.parser.patch, spec: data });
    eventInputPatch.timeEnd();

    const eventParser = logger.timeEvent('parser');
    if (
      config.experimentalParser &&
      !isLegacyClient(config) &&
      !legacyNameFromConfig(config)
    ) {
      context = parseOpenApiSpec({ config, dependencies, logger, spec: data });
    }

    // fallback to legacy parser
    if (!context) {
      const parsed = parseLegacy({ openApi: data });
      client = postProcessClient(parsed, config);
    }
    eventParser.timeEnd();

    const eventGenerator = logger.timeEvent('generator');
    if (context) {
      await generateOutput({ context });
    } else if (client) {
      await generateLegacyOutput({ client, openApi: data, templates });
    }
    eventGenerator.timeEnd();

    const eventPostprocess = logger.timeEvent('postprocess');
    if (!config.dryRun) {
      processOutput({ config });

      if (config.logs.level !== 'silent') {
        const outputPath = process.env.INIT_CWD
          ? `./${path.relative(process.env.INIT_CWD, config.output.path)}`
          : config.output.path;
        console.log(
          `${colors.green('🚀 Done!')} Your output is in ${colors.cyanBright(outputPath)}`,
        );
      }
    }
    eventPostprocess.timeEnd();
  }

  if (config.input.watch.enabled && typeof inputPath.path === 'string') {
    setTimeout(() => {
      createClient({ config, dependencies, logger, templates, watch });
    }, config.input.watch.interval);
  }

  return context || client;
};
