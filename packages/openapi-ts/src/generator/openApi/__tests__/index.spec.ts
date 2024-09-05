import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Config } from '../../../types/config';
import { parse } from '..';
import type { Config as ParserConfig } from '../common/interfaces/config';
import type { OpenApi } from '../common/interfaces/OpenApi';
import * as parseV2 from '../v2';
import * as parseV3 from '../v3';

const config: ParserConfig = {
  filterFn: {
    operation: () => true,
    operationParameter: () => true,
  },
  nameFn: {
    operation: () => 'operation',
    operationParameter: () => 'operationParameter',
  },
};

vi.mock('../../../utils/config', () => {
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

    const spec: OpenApi = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      paths: {},
      swagger: '2',
    };
    parse({
      config,
      openApi: spec,
    });
    expect(spy).toHaveBeenCalledWith({ config, openApi: spec });

    const spec2: OpenApi = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      paths: {},
      swagger: '2.0',
    };
    parse({ config, openApi: spec2 });
    expect(spy).toHaveBeenCalledWith({ config, openApi: spec2 });
  });

  it('uses v3 parser', () => {
    const spy = vi.spyOn(parseV3, 'parse');

    const spec: OpenApi = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      openapi: '3',
      paths: {},
    };
    parse({ config, openApi: spec });
    expect(spy).toHaveBeenCalledWith({ config, openApi: spec });

    const spec2: OpenApi = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      openapi: '3.0',
      paths: {},
    };
    parse({ config, openApi: spec2 });
    expect(spy).toHaveBeenCalledWith({ config, openApi: spec2 });

    const spec3: OpenApi = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      openapi: '3.1.0',
      paths: {},
    };
    parse({ config, openApi: spec3 });
    expect(spy).toHaveBeenCalledWith({ config, openApi: spec3 });
  });

  it('throws on unknown version', () => {
    // @ts-ignore
    expect(() => parse({ openApi: { foo: 'bar' } })).toThrow(
      `Unsupported Open API specification: ${JSON.stringify({ foo: 'bar' }, null, 2)}`,
    );
  });
});
