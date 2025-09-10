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

  // After expansion, output should always be a single output (string or Output object)
  // but TypeScript doesn't know this, so we need to handle the array case defensively
  const singleOutput = Array.isArray(userConfig.output)
    ? userConfig.output[0]
    : userConfig.output;

  if (typeof singleOutput === 'string') {
    output.path = singleOutput;
  } else {
    output = {
      ...output,
      ...singleOutput,
    };
  }

  return output;
};
