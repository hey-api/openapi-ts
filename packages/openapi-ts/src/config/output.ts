import type { Config, UserConfig } from '../types/config';

export const getOutput = (userConfig: UserConfig): Config['output'] => {
  let output: Config['output'] = {
    clean: true,
    format: false,
    indexFile: true,
    lint: false,
    path: '',
    tsConfigPath: '',
  };

  if (typeof userConfig.output === 'string') {
    output.path = userConfig.output;
  } else {
    output = {
      ...output,
      ...userConfig.output,
    };
  }

  return output;
};
