import path from 'node:path';

import { $RefParser } from '@hey-api/json-schema-ref-parser';
import colors from 'ansi-colors';

import { generateLegacyOutput } from '~/generate/legacy/output';
import { generateOutput } from '~/generate/output';
import { getSpec } from '~/getSpec';
import type { Context } from '~/ir/context';
import { parseLegacy, parseOpenApiSpec } from '~/openApi';
import { buildGraph } from '~/openApi/shared/utils/graph';
import { patchOpenApiSpec } from '~/openApi/shared/utils/patch';
import { processOutput } from '~/processOutput';
import type { Client } from '~/types/client';
import type { Config } from '~/types/config';
import type { Input } from '~/types/input';
import type { WatchValues } from '~/types/types';
import { isLegacyClient, legacyNameFromConfig } from '~/utils/config';
import type { Templates } from '~/utils/handlebars';
import type { Logger } from '~/utils/logger';
import { postProcessClient } from '~/utils/postprocess';

export const compileInputPath = (input: Omit<Input, 'watch'>) => {
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
};

const logInputPaths = (
  inputPaths: ReadonlyArray<ReturnType<typeof compileInputPath>>,
  jobIndex: number,
) => {
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
};

export const createClient = async ({
  config,
  dependencies,
  jobIndex,
  logger,
  templates,
  watches: _watches,
}: {
  config: Config;
  dependencies: Record<string, string>;
  jobIndex: number;
  logger: Logger;
  templates: Templates;
  /**
   * Always undefined on the first run, defined on subsequent runs.
   */
  watches?: ReadonlyArray<WatchValues>;
}): Promise<Client | undefined | Context> => {
  const watches: ReadonlyArray<WatchValues> =
    _watches ||
    Array.from({ length: config.input.length }, () => ({
      headers: new Headers(),
    }));

  const inputPaths = config.input.map((input) => compileInputPath(input));

  // on first run, print the message as soon as possible
  if (config.logs.level !== 'silent' && !_watches) {
    logInputPaths(inputPaths, jobIndex);
  }

  const getSpecData = async (input: Input, index: number) => {
    const eventSpec = logger.timeEvent('spec');
    const { arrayBuffer, error, resolvedInput, response } = await getSpec({
      fetchOptions: input.fetch,
      inputPath: inputPaths[index]!.path,
      timeout: input.watch.timeout,
      watch: watches[index]!,
    });
    eventSpec.timeEnd();

    // throw on first run if there's an error to preserve user experience
    // if in watch mode, subsequent errors won't throw to gracefully handle
    // cases where server might be reloading
    if (error && !_watches) {
      throw new Error(
        `Request failed with status ${response.status}: ${response.statusText}`,
      );
    }

    return { arrayBuffer, resolvedInput };
  };
  const specData = (
    await Promise.all(
      config.input.map((input, index) => getSpecData(input, index)),
    )
  ).filter((data) => data.arrayBuffer || data.resolvedInput);

  let client: Client | undefined;
  let context: Context | undefined;

  if (specData.length) {
    const refParser = new $RefParser();
    const data =
      specData.length > 1
        ? await refParser.bundleMany({
            arrayBuffer: specData.map((data) => data.arrayBuffer!),
            pathOrUrlOrSchemas: [],
            resolvedInputs: specData.map((data) => data.resolvedInput!),
          })
        : await refParser.bundle({
            arrayBuffer: specData[0]!.arrayBuffer,
            pathOrUrlOrSchema: undefined,
            resolvedInput: specData[0]!.resolvedInput,
          });

    // on subsequent runs in watch mode, print the message only if we know we're
    // generating the output
    if (config.logs.level !== 'silent' && _watches) {
      console.clear();
      logInputPaths(inputPaths, jobIndex);
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

    if (context) {
      context.graph = buildGraph(context.ir, logger).graph;
    } else {
      // fallback to legacy parser
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
        const jobPrefix = colors.gray(`[Job ${jobIndex + 1}] `);
        console.log(
          `${jobPrefix}${colors.green('✅ Done!')} Your output is in ${colors.cyanBright(outputPath)}`,
        );
      }
    }
    eventPostprocess.timeEnd();
  }

  const watchedInput = config.input.find(
    (input, index) =>
      input.watch.enabled && typeof inputPaths[index]!.path === 'string',
  );

  if (watchedInput) {
    setTimeout(() => {
      createClient({
        config,
        dependencies,
        jobIndex,
        logger,
        templates,
        watches,
      });
    }, watchedInput.watch.interval);
  }

  return context || client;
};
