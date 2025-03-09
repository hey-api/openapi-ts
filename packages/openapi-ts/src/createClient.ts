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

export const createClient = async ({
  config,
  templates,
  watch: _watch,
}: {
  config: Config;
  templates: Templates;
  watch?: WatchValues;
}) => {
  const inputPath = config.input.path;
  const timeout = config.watch.timeout;

  const watch: WatchValues = _watch || { headers: new Headers() };

  Performance.start('spec');
  const { data, error, response } = await getSpec({
    inputPath,
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
    if (config.logs.level !== 'silent') {
      if (_watch) {
        console.clear();
        console.log(`⏳ Input changed, generating from ${inputPath}`);
      } else {
        console.log(`⏳ Generating from ${inputPath}`);
      }
    }

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

  if (config.watch.enabled && typeof inputPath === 'string') {
    setTimeout(() => {
      createClient({ config, templates, watch });
    }, config.watch.interval);
  }

  return context || client;
};
