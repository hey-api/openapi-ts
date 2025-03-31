// copy-pasted from @hey-api/client-fetch
export const mergeHeaders = (
  ...headers: Array<RequestInit['headers'] | undefined>
): Headers => {
  const mergedHeaders = new Headers();
  for (const header of headers) {
    if (!header || typeof header !== 'object') {
      continue;
    }

    const iterator =
      header instanceof Headers ? header.entries() : Object.entries(header);

    for (const [key, value] of iterator) {
      if (value === null) {
        mergedHeaders.delete(key);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          mergedHeaders.append(key, v as string);
        }
      } else if (value !== undefined) {
        // assume object headers are meant to be JSON stringified, i.e. their
        // content value in OpenAPI specification is 'application/json'
        mergedHeaders.set(
          key,
          typeof value === 'object' ? JSON.stringify(value) : (value as string),
        );
      }
    }
  }
  return mergedHeaders;
};
