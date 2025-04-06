import type { IR } from '../../../ir/types';
import { parseUrl } from '../../../utils/url';

export const parseServers = ({ context }: { context: IR.Context }) => {
  let schemes: ReadonlyArray<string> = context.spec.schemes ?? [];
  let host = context.spec.host ?? '';
  const path = context.spec.basePath ?? '';

  if (typeof context.config.input.path === 'string') {
    const url = parseUrl(context.config.input.path);

    if (!schemes.length) {
      if (url.protocol) {
        schemes = [url.protocol] as typeof schemes;
      }
    }

    if (!host) {
      host = `${url.host}${url.port ? `:${url.port}` : ''}`;
    }
  }

  if (!schemes.length) {
    schemes = [''];
  }

  const servers = schemes
    .map((scheme) => `${scheme ? `${scheme}://` : ''}${host}${path}`)
    .filter(Boolean);

  if (servers.length) {
    context.ir.servers = servers.map((url) => ({
      url,
    }));
  }
};
