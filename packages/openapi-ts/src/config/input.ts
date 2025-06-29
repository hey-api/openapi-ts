import type { Config, UserConfig } from '../types/config';

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
      path: 'https://get.heyapi.dev',
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
