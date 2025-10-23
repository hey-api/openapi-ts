import type { Config, UserConfig } from '~/types/config';

export const getLogs = (
  userConfig: Pick<UserConfig, 'logs'> | undefined,
): Config['logs'] => {
  let logs: Config['logs'] = {
    file: true,
    level: 'info',
    path: process.cwd(),
  };

  if (typeof userConfig?.logs === 'string') {
    logs.path = userConfig.logs;
  } else {
    logs = {
      ...logs,
      ...userConfig?.logs,
    };
  }

  return logs;
};
