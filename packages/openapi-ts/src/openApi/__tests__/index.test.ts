import { afterEach, describe, expect, it, vi } from 'vitest';

import type { OpenApiV3_0_X } from '~/openApi/3.0.x';
import { parseV3_0_X } from '~/openApi/3.0.x';
import type { OpenApiV3_1_X } from '~/openApi/3.1.x';
import { parseV3_1_X } from '~/openApi/3.1.x';

import type { Config } from '../../types/config';
import { parseOpenApiSpec } from '..';

vi.mock('../3.0.x', () => ({
  parseV3_0_X: vi.fn(),
}));
vi.mock('../3.1.x', () => ({
  parseV3_1_X: vi.fn(),
}));
vi.mock('../../utils/config', () => {
  const config: Partial<Config> = {
    logs: {
      file: false,
      level: 'silent',
      path: '',
    },
    pluginOrder: [],
  };
  return {
    getConfig: () => config,
  };
});

describe('OpenAPI parser', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles OpenAPI 3.0.0', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.0',
      paths: {},
    };
    parseOpenApiSpec({
      config: {
        output: {
          // @ts-expect-error
          fileName: {},
          path: '',
        },
      },
      spec,
    });
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.1', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.1',
      paths: {},
    };
    parseOpenApiSpec({
      config: {
        output: {
          // @ts-expect-error
          fileName: {},
          path: '',
        },
      },
      spec,
    });
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.2', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.2',
      paths: {},
    };
    parseOpenApiSpec({
      config: {
        output: {
          // @ts-expect-error
          fileName: {},
          path: '',
        },
      },
      spec,
    });
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.3', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.3',
      paths: {},
    };
    parseOpenApiSpec({
      config: {
        output: {
          // @ts-expect-error
          fileName: {},
          path: '',
        },
      },
      spec,
    });
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.0.4', () => {
    const spec: OpenApiV3_0_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.0.4',
      paths: {},
    };
    parseOpenApiSpec({
      config: {
        output: {
          // @ts-expect-error
          fileName: {},
          path: '',
        },
      },
      spec,
    });
    expect(parseV3_0_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.1.0', () => {
    const spec: OpenApiV3_1_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.1.0',
    };
    parseOpenApiSpec({
      config: {
        output: {
          // @ts-expect-error
          fileName: {},
          path: '',
        },
      },
      spec,
    });
    expect(parseV3_1_X).toHaveBeenCalled();
  });

  it('handles OpenAPI 3.1.1', () => {
    const spec: OpenApiV3_1_X = {
      info: {
        title: '',
        version: '1',
      },
      openapi: '3.1.1',
    };
    parseOpenApiSpec({
      config: {
        output: {
          // @ts-expect-error
          fileName: {},
          path: '',
        },
      },
      spec,
    });
    expect(parseV3_1_X).toHaveBeenCalled();
  });
});
