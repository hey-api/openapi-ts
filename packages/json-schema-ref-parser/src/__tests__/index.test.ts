import path from 'node:path';

import { getResolvedInput } from '../index';

describe('getResolvedInput', () => {
  it('handles url', async () => {
    const pathOrUrlOrSchema = 'https://foo.com';
    const resolvedInput = await getResolvedInput({ pathOrUrlOrSchema });
    expect(resolvedInput.type).toBe('url');
    expect(resolvedInput.schema).toBeUndefined();
    expect(resolvedInput.path).toBe('https://foo.com/');
  });

  it('handles file', async () => {
    const pathOrUrlOrSchema = './path/to/openapi.json';
    const resolvedInput = await getResolvedInput({ pathOrUrlOrSchema });
    expect(resolvedInput.type).toBe('file');
    expect(resolvedInput.schema).toBeUndefined();
    expect(path.normalize(resolvedInput.path).toLowerCase()).toBe(
      path.normalize(path.resolve('./path/to/openapi.json')).toLowerCase(),
    );
  });

  it('handles raw spec', async () => {
    const pathOrUrlOrSchema = {
      info: {
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {},
    };
    const resolvedInput = await getResolvedInput({ pathOrUrlOrSchema });
    expect(resolvedInput.type).toBe('json');
    expect(resolvedInput.schema).toEqual({
      info: {
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {},
    });
    expect(resolvedInput.path).toBe('');
  });
});
