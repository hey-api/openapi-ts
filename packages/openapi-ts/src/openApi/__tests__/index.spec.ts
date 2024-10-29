import { afterEach, describe, expect, it, vi } from 'vitest';

import { type OpenApi, parseExperimental, parseLegacy } from '..';
import type { OpenApiV3_0_0 } from '../3.0.x';
import { parseV3_0_0 } from '../3.0.x';
import type { OpenApiV3_1_0 } from '../3.1.x';
import { parseV3_1_0 } from '../3.1.x';
import type { ParserConfig } from '../config';
import * as parseV2 from '../v2';
import * as parseV3 from '../v3';

vi.mock('../3.0.x', () => ({
  parseV3_0_0: vi.fn(),
}));
vi.mock('../3.1.x', () => ({
  parseV3_1_0: vi.fn(),
}));

const parserConfig: ParserConfig = {
  filterFn: {
    operation: () => true,
    operationParameter: () => true,
  },
  nameFn: {
    operation: () => 'operation',
    operationParameter: () => 'operationParameter',
  },
};

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
    parseLegacy({ openApi: spec, parserConfig });
    expect(spy).toHaveBeenCalledWith(spec);

    const spec2: OpenApi = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      paths: {},
      swagger: '2.0',
    };
    parseLegacy({ openApi: spec2, parserConfig });
    expect(spy).toHaveBeenCalledWith(spec2);
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
    parseLegacy({ openApi: spec, parserConfig });
    expect(spy).toHaveBeenCalledWith(spec);

    const spec2: OpenApi = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      openapi: '3.0',
      paths: {},
    };
    parseLegacy({ openApi: spec2, parserConfig });
    expect(spy).toHaveBeenCalledWith(spec2);

    const spec3: OpenApi = {
      info: {
        title: 'dummy',
        version: '1.0',
      },
      openapi: '3.1.0',
      paths: {},
    };
    parseLegacy({ openApi: spec3, parserConfig });
    expect(spy).toHaveBeenCalledWith(spec3);
  });

  it('throws on unknown version', () => {
    expect(() =>
      // @ts-expect-error
      parseLegacy({ openApi: { foo: 'bar' }, parserConfig }),
    ).toThrow(
      `Unsupported OpenAPI specification: ${JSON.stringify({ foo: 'bar' }, null, 2)}`,
    );
  });
});

describe('experimentalParser', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles OpenAPI 3.0.0', () => {
    const spec: OpenApiV3_0_0 = {
      // info: {
      //   title: '',
      //   version: '1',
      // },
      openapi: '3.0.0',
    };
    parseExperimental({
      // @ts-ignore
      config: {},
      parserConfig,
      spec,
    });
    expect(parseV3_0_0).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.1', () => {
    const spec: OpenApiV3_0_0 = {
      // info: {
      //   title: '',
      //   version: '1',
      // },
      openapi: '3.0.1',
    };
    parseExperimental({
      // @ts-ignore
      config: {},
      parserConfig,
      spec,
    });
    expect(parseV3_0_0).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.2', () => {
    const spec: OpenApiV3_0_0 = {
      // info: {
      //   title: '',
      //   version: '1',
      // },
      openapi: '3.0.2',
    };
    parseExperimental({
      // @ts-ignore
      config: {},
      parserConfig,
      spec,
    });
    expect(parseV3_0_0).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.3', () => {
    const spec: OpenApiV3_0_0 = {
      // info: {
      //   title: '',
      //   version: '1',
      // },
      openapi: '3.0.3',
    };
    parseExperimental({
      // @ts-ignore
      config: {},
      parserConfig,
      spec,
    });
    expect(parseV3_0_0).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.4', () => {
    const spec: OpenApiV3_0_0 = {
      // info: {
      //   title: '',
      //   version: '1',
      // },
      openapi: '3.0.4',
    };
    parseExperimental({
      // @ts-ignore
      config: {},
      parserConfig,
      spec,
    });
    expect(parseV3_0_0).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.1.0', () => {
    const spec: OpenApiV3_1_0 = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.1.0',
    };
    parseExperimental({
      // @ts-ignore
      config: {},
      parserConfig,
      spec,
    });
    expect(parseV3_1_0).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.1.1', () => {
    const spec: OpenApiV3_1_0 = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.1.1',
    };
    parseExperimental({
      // @ts-ignore
      config: {},
      parserConfig,
      spec,
    });
    expect(parseV3_1_0).toHaveBeenCalled();
  });
});
