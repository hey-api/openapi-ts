import type { IR } from '../../../ir/types';
import { parseUrl } from '../../../utils/url';

export const parseServers = ({ context }: { context: IR.Context }) => {
  if (context.spec.servers) {
    context.ir.servers = context.spec.servers;
    return;
  }

  if (typeof context.config.input.path === 'string') {
    const url = parseUrl(context.config.input.path);
    context.ir.servers = [
      {
        url: `${url.protocol ? `${url.protocol}://` : ''}${url.host}${url.port ? `:${url.port}` : ''}`,
      },
    ];
  }

  if (!context.ir.servers) {
    context.ir.servers = [
      {
        url: '/',
      },
    ];
  }
};
