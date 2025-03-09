import type { Config, UserConfig } from './types/config';

export const getLogs = (userConfig: UserConfig): Config['logs'] => {
  let logs: Config['logs'] = {
    level: 'info',
    path: process.cwd(),
  };
  if (typeof userConfig.logs === 'string') {
    logs.path = userConfig.logs;
  } else {
    logs = {
      ...logs,
      ...userConfig.logs,
    };
  }
  return logs;
};
