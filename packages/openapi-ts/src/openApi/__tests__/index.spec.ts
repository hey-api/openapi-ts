import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Config } from '../../types/config';
import { parse } from '..';
import * as parseV2 from '../v2';
import * as parseV3 from '../v3';

vi.mock('../../utils/config', () => {
  const config: Partial<Config> = {
    services: {},
    types: {},
  };
  return {
    getConfig: () => config,
  };
});

describe('parse', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses v2 parser', () => {
    const spy = vi.spyOn(parseV2, 'parse');

    const spec: Parameters<typeof parse>[0] = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      paths: {},
      swagger: '2',
    };
    parse(spec);
    expect(spy).toHaveBeenCalledWith(spec);

    const spec2: Parameters<typeof parse>[0] = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      paths: {},
      swagger: '2.0',
    };
    parse(spec2);
    expect(spy).toHaveBeenCalledWith(spec2);
  });

  it('uses v3 parser', () => {
    const spy = vi.spyOn(parseV3, 'parse');

    const spec: Parameters<typeof parse>[0] = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      openapi: '3',
      paths: {},
    };
    parse(spec);
    expect(spy).toHaveBeenCalledWith(spec);

    const spec2: Parameters<typeof parse>[0] = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      openapi: '3.0',
      paths: {},
    };
    parse(spec2);
    expect(spy).toHaveBeenCalledWith(spec2);

    const spec3: Parameters<typeof parse>[0] = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      openapi: '3.1.0',
      paths: {},
    };
    parse(spec3);
    expect(spy).toHaveBeenCalledWith(spec3);
  });

  it('throws on unknown version', () => {
    // @ts-ignore
    expect(() => parse({ foo: 'bar' })).toThrow(
      `Unsupported Open API specification: ${JSON.stringify({ foo: 'bar' }, null, 2)}`,
    );
  });
});
