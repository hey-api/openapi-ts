import path from 'node:path';

import { generateLegacyOutput, generateOutput } from './generate/output';
import { getSpec } from './getSpec';
import type { IR } from './ir/types';
import { parseLegacy, parseOpenApiSpec } from './openApi';
import { processOutput } from './processOutput';
import type { Client } from './types/client';
import type { Config } from './types/config';
import type { WatchValues } from './types/types';
import { isLegacyClient, legacyNameFromConfig } from './utils/config';
import type { Templates } from './utils/handlebars';
import { Performance } from './utils/performance';
import { postProcessClient } from './utils/postprocess';

const compileInputPath = ({ config }: { config: Config }) => {
  const result = {
    api_key: undefined as unknown as typeof config.input.api_key,
    branch: undefined as unknown as typeof config.input.branch,
    commit_sha: undefined as unknown as typeof config.input.commit_sha,
    organization: undefined as string | undefined,
    path: undefined as unknown as typeof config.input.path,
    project: undefined as string | undefined,
    tags: [] as unknown as typeof config.input.tags,
    version: undefined as unknown as typeof config.input.version,
  };

  if (
    typeof config.input.path !== 'string' ||
    !config.input.path.startsWith('https://get.heyapi.dev')
  ) {
    result.path = config.input.path;
    return result;
  }

  // TODO: assign query params into correct slots
  // queryPath
  const [basePath] = config.input.path.split('?');

  let path = basePath!;
  if (path.endsWith('/')) {
    path = path.slice(0, path.length - 1);
  }

  const pathParts = path.split('/');
  result.organization = pathParts[pathParts.length - 2];
  result.project = pathParts[pathParts.length - 1];

  const queryParams: Array<string> = [];

  if (config.input.api_key) {
    result.api_key = config.input.api_key;
    queryParams.push(`api_key=${result.api_key}`);
  }

  if (config.input.branch) {
    result.branch = config.input.branch;
    queryParams.push(`branch=${result.branch}`);
  }

  if (config.input.commit_sha) {
    result.commit_sha = config.input.commit_sha;
    queryParams.push(`commit_sha=${result.commit_sha}`);
  }

  if (config.input.tags?.length) {
    result.tags = config.input.tags;
    queryParams.push(`tags=${result.tags.join(',')}`);
  }

  if (config.input.version) {
    result.version = config.input.version;
    queryParams.push(`version=${result.version}`);
  }

  const query = queryParams.join('&');
  result.path = query ? `${path}?${query}` : path;

  return result;
};

const logInputPath = ({
  config,
  inputPath,
  watch,
}: {
  config: Config;
  inputPath: ReturnType<typeof compileInputPath>;
  watch?: boolean;
}) => {
  if (config.logs.level === 'silent') {
    return;
  }

  if (watch) {
    console.clear();
    if (typeof inputPath.path === 'string') {
      if (inputPath.organization) {
        console.log(
          `⏳ Input changed, generating from ${inputPath.organization}/${inputPath.project}`,
        );
        if (inputPath.branch) {
          console.log(`branch: ${inputPath.branch}`);
        }
        if (inputPath.commit_sha) {
          console.log(`commit: ${inputPath.commit_sha}`);
        }
        if (inputPath.tags?.length) {
          console.log(`tags: ${inputPath.tags.join(', ')}`);
        }
        if (inputPath.version) {
          console.log(`version: ${inputPath.version}`);
        }
      } else {
        console.log(`⏳ Input changed, generating from ${inputPath.path}`);
      }
    } else {
      console.log(`⏳ Input changed, generating from ${inputPath.path}`);
    }
  } else {
    if (typeof inputPath.path === 'string') {
      if (inputPath.organization) {
        console.log(
          `⏳ Generating from ${inputPath.organization}/${inputPath.project}`,
        );
        if (inputPath.branch) {
          console.log(`branch: ${inputPath.branch}`);
        }
        if (inputPath.commit_sha) {
          console.log(`commit: ${inputPath.commit_sha}`);
        }
        if (inputPath.tags?.length) {
          console.log(`tags: ${inputPath.tags.join(', ')}`);
        }
        if (inputPath.version) {
          console.log(`version: ${inputPath.version}`);
        }
      } else {
        console.log(`⏳ Generating from ${inputPath.path}`);
      }
    } else {
      console.log(`⏳ Generating from ${inputPath.path}`);
    }
  }
};

export const createClient = async ({
  config,
  templates,
  watch: _watch,
}: {
  config: Config;
  templates: Templates;
  watch?: WatchValues;
}) => {
  const inputPath = compileInputPath({ config });
  const timeout = config.watch.timeout;

  const watch: WatchValues = _watch || { headers: new Headers() };

  Performance.start('spec');
  const { data, error, response } = await getSpec({
    inputPath: inputPath.path,
    timeout,
    watch,
  });
  Performance.end('spec');

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
    logInputPath({
      config,
      inputPath,
      watch: Boolean(_watch),
    });

    Performance.start('parser');
    if (
      config.experimentalParser &&
      !isLegacyClient(config) &&
      !legacyNameFromConfig(config)
    ) {
      context = parseOpenApiSpec({ config, spec: data });
    }

    // fallback to legacy parser
    if (!context) {
      const parsed = parseLegacy({ openApi: data });
      client = postProcessClient(parsed, config);
    }
    Performance.end('parser');

    Performance.start('generator');
    if (context) {
      await generateOutput({ context });
    } else if (client) {
      await generateLegacyOutput({ client, openApi: data, templates });
    }
    Performance.end('generator');

    Performance.start('postprocess');
    if (!config.dryRun) {
      processOutput({ config });

      if (config.logs.level !== 'silent') {
        const outputPath = process.env.INIT_CWD
          ? `./${path.relative(process.env.INIT_CWD, config.output.path)}`
          : config.output.path;
        console.log(`🚀 Done! Your output is in ${outputPath}`);
      }
    }
    Performance.end('postprocess');
  }

  if (config.watch.enabled && typeof inputPath.path === 'string') {
    setTimeout(() => {
      createClient({ config, templates, watch });
    }, config.watch.interval);
  }

  return context || client;
};
