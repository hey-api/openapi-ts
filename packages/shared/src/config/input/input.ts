import type { MaybeArray } from '@hey-api/types';

import { coerce } from '../../normalize/coerce';
import { defineConfig } from '../../normalize/config';
import { opaque } from '../../normalize/opaque';
import { inputToApiRegistry } from '../../utils/input';
import { heyApiRegistryBaseUrl } from '../../utils/input/heyApi';
import type { Input, UserInput, UserWatch, Watch } from './types';

const watchConfig = defineConfig<UserWatch | undefined, Watch>({
  $coerce: {
    boolean: (v) => ({ enabled: v }),
    number: (v) => ({ enabled: true, interval: v }),
  },
  enabled: false,
  interval: 1_000,
  timeout: 60_000,
});

const inputConfig = defineConfig<UserInput | string, Input>({
  $coerce: {
    string: (path) => ({ path }),
  },
  $finalize(config, input) {
    if (input && typeof input === 'object' && 'organization' in input && config.path === '') {
      config.path = heyApiRegistryBaseUrl;
    }
  },
  path: opaque<string | object>('', (input) =>
    input && typeof input === 'object' && !('path' in input) && !('organization' in input)
      ? input
      : undefined,
  ),
  watch: coerce((value) => watchConfig(value)),
});

export function getInput(userConfig: {
  input: MaybeArray<UserInput | Required<UserInput>['path']>;
  watch?: UserWatch;
}): ReadonlyArray<Input> {
  const userInputs = userConfig.input instanceof Array ? userConfig.input : [userConfig.input];

  const inputs: Array<Input> = [];

  for (const userInput of userInputs) {
    const input = inputConfig(userInput);

    if (!input.path) continue;

    if (typeof input.path === 'string') {
      inputToApiRegistry(input as Input & { path: string });
    }

    // deprecated top-level `watch` — only applies when input hasn't set its own
    if (
      userConfig.watch !== undefined &&
      input.watch.enabled === false &&
      input.watch.interval === 1_000 &&
      input.watch.timeout === 60_000
    ) {
      input.watch = watchConfig(userConfig.watch);
    }

    inputs.push(input);
  }

  return inputs;
}
