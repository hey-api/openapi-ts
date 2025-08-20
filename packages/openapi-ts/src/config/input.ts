import type { Config, UserConfig } from '../types/config';
import type { Input } from '../types/input';
import {
  heyApiRegistryBaseUrl,
  inputToHeyApiPath,
} from '../utils/input/heyApi';
import { inputToReadmePath } from '../utils/input/readme';

const defaultWatch: Config['input']['watch'] = {
  enabled: false,
  interval: 1_000,
  timeout: 60_000,
};

const getWatch = (
  input: Pick<Config['input'], 'path' | 'watch'>,
): Config['input']['watch'] => {
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
};

export const getInput = (userConfig: UserConfig): Config['input'] => {
  let input: Config['input'] = {
    path: '',
    watch: defaultWatch,
  };

  if (typeof userConfig.input === 'string') {
    input.path = userConfig.input;
  } else if (
    userConfig.input &&
    (userConfig.input.path !== undefined ||
      userConfig.input.organization !== undefined)
  ) {
    // @ts-expect-error
    input = {
      ...input,
      path: heyApiRegistryBaseUrl,
      ...userConfig.input,
    };

    // watch only remote files
    if (input.watch !== undefined) {
      input.watch = getWatch(input);
    }
  } else {
    input = {
      ...input,
      path: userConfig.input as Record<string, unknown>,
    };
  }

  if (typeof input.path === 'string') {
    if (input.path.startsWith('readme:')) {
      input.path = inputToReadmePath(input.path);
    } else if (!input.path.startsWith('.')) {
      if (input.path.startsWith(heyApiRegistryBaseUrl)) {
        input.path = input.path.slice(heyApiRegistryBaseUrl.length + 1);
        input.path = inputToHeyApiPath(input as Input & { path: string });
      } else {
        const parts = input.path.split('/');
        const cleanParts = parts.filter(Boolean);
        if (parts.length === 2 && cleanParts.length === 2) {
          input.path = inputToHeyApiPath(input as Input & { path: string });
        }
      }
    }
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

  return input;
};
