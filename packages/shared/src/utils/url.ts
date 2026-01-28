const parseUrlRegExp =
  /^(([^:/?#]+):)?((\/\/)?([^:/?#]*)(:?([^/?#]*)))?([^?#]*)(\?([^#]*))?(#(.*))?/;

interface Url {
  host: string;
  path: string;
  port: string;
  protocol: string;
}

export function parseUrl(value: string): Url {
  const errorResponse: Url = {
    host: '',
    path: '',
    port: '',
    protocol: '',
  };

  parseUrlRegExp.lastIndex = 0;
  const match = value.match(parseUrlRegExp);

  if (!match) {
    return errorResponse;
  }

  const host = match[5] || '';

  // value is a relative file system path
  if (host === '.' || host === '..') {
    return errorResponse;
  }

  const path = match[8] || '';
  const protocol = match[2] || '';

  // value is probably a Windows file system path
  if (protocol.length === 1) {
    return errorResponse;
  }

  return {
    host,
    path: path === '/' ? '' : path,
    port: match[7] || '',
    protocol,
  };
}
