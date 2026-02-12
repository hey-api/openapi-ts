import type { MaybeArray } from '@hey-api/types';

import { inputToApiRegistry } from '../../utils/input';
import { heyApiRegistryBaseUrl } from '../../utils/input/heyApi';
import type { Input, UserInput, UserWatch, Watch } from './types';

const defaultWatch: Watch = {
  enabled: false,
  interval: 1_000,
  timeout: 60_000,
};

// watch only remote files
function getWatch(input: Pick<Input, 'path' | 'watch'>): Watch {
  let watch = { ...defaultWatch };

  // we cannot watch spec passed as an object
  if (typeof input.path !== 'string') {
    return watch;
  }

  if (typeof input.watch === 'boolean') {
    watch.enabled = input.watch;
  } else if (typeof input.watch === 'number') {
    watch.enabled = true;
    watch.interval = input.watch;
  } else if (input.watch) {
    watch = {
      ...watch,
      ...input.watch,
    };
  }

  return watch;
}

export function getInput(userConfig: {
  input: MaybeArray<UserInput | Required<UserInput>['path']>;
  watch?: UserWatch;
}): ReadonlyArray<Input> {
  const userInputs = userConfig.input instanceof Array ? userConfig.input : [userConfig.input];

  const inputs: Array<Input> = [];

  for (const userInput of userInputs) {
    let input: Input = {
      path: '',
      watch: defaultWatch,
    };

    if (typeof userInput === 'string') {
      input.path = userInput;
    } else if (
      userInput &&
      (userInput.path !== undefined || userInput.organization !== undefined)
    ) {
      // @ts-expect-error
      input = {
        ...input,
        path: heyApiRegistryBaseUrl,
        ...userInput,
      };

      if (input.watch !== undefined) {
        input.watch = getWatch(input);
      }
    } else {
      input = {
        ...input,
        path: userInput,
      };
    }

    if (typeof input.path === 'string') {
      inputToApiRegistry(input as Input & { path: string });
    }

    if (
      userConfig.watch !== undefined &&
      input.watch.enabled === defaultWatch.enabled &&
      input.watch.interval === defaultWatch.interval &&
      input.watch.timeout === defaultWatch.timeout
    ) {
      input.watch = getWatch({
        path: input.path,
        // @ts-expect-error
        watch: userConfig.watch,
      });
    }

    if (input.path) {
      inputs.push(input);
    }
  }

  return inputs;
}
