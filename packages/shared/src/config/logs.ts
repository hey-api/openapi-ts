import type { Logs } from '../types/logs';

export function getLogs(userLogs: string | Logs | undefined): Logs {
  let logs: Logs = {
    file: true,
    level: 'info',
    path: process.cwd(),
  };

  if (typeof userLogs === 'string') {
    logs.path = userLogs;
  } else {
    logs = {
      ...logs,
      ...userLogs,
    };
  }

  return logs;
}
