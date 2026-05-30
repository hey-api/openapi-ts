import { defineConfig } from '../config';

describe('normalize/value', () => {
  it('does not recurse infinitely when cascading nested "types" tables', () => {
    const normalize = defineConfig({
      $cascade: ['types'],
      requests: {
        body: {
          enabled: true,
          types: {
            infer: { enabled: false },
            input: { enabled: false },
            output: { enabled: false },
          },
        },
        headers: {
          enabled: true,
          types: {
            infer: { enabled: false },
            input: { enabled: false },
            output: { enabled: false },
          },
        },
      },
      responses: {
        enabled: true,
        types: {
          infer: { enabled: false },
          input: { enabled: false },
          output: { enabled: false },
        },
      },
      types: {
        infer: { enabled: false },
        input: { enabled: false },
        output: { enabled: false },
      },
    });

    expect(() => normalize({})).not.toThrow();
  });

  it('propagates scalar cascade keys to nested tables when missing', () => {
    const normalize = defineConfig({
      $cascade: ['case'],
      case: 'camelCase' as any,
      requests: {},
    });

    const result = normalize({});

    // @ts-expect-error
    expect(result.requests.case).toBe('camelCase');
  });

  it('keeps explicit nested scalar overrides', () => {
    const normalize = defineConfig({
      $cascade: ['case'],
      case: 'camelCase' as any,
      requests: {
        case: 'snake_case',
      },
    });

    const result = normalize({});

    expect(result.requests.case).toBe('snake_case');
  });

  it('coerces root types', () => {
    const normalize = defineConfig({
      $cascade: ['types'],
      definitions: {
        types: {
          infer: {
            $coerceAny: (e: any) => ({
              enabled: Boolean(e.value),
              name: e.value ? 'yes' : 'no',
            }),
            enabled: false,
            name: '',
          },
          input: { enabled: false },
          output: { enabled: false },
        },
      },
      types: {
        infer: {
          $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
          enabled: false,
        },
        input: {
          $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
          enabled: false,
        },
        output: {
          $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
          enabled: false,
        },
      },
    });

    const result = normalize({
      types: {
        infer: true,
        input: true,
        output: {
          enabled: false,
        },
      },
    });

    expect(result.types.infer.enabled).toBe(true);
    expect(result.types.input.enabled).toBe(true);
    expect(result.types.output.enabled).toBe(false);
    expect(result.definitions.types.infer.enabled).toBe(true);
    expect(result.definitions.types.infer.name).toBe('yes');
    expect(result.definitions.types.input.enabled).toBe(true);
    expect(result.definitions.types.output.enabled).toBe(false);
  });

  it('coerces nested types', () => {
    const normalize = defineConfig({
      $cascade: ['types'],
      definitions: {
        types: {
          infer: { enabled: false },
          input: { enabled: false },
          output: { enabled: false },
        },
      },
      types: {
        infer: {
          $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
          enabled: false,
        },
        input: {
          $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
          enabled: false,
        },
        output: {
          $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
          enabled: false,
        },
      },
    });

    const result = normalize({
      definitions: {
        types: {
          infer: true,
          input: {},
          output: false,
        },
      },
    });

    expect(result.definitions.types.infer.enabled).toBe(true);
    expect(result.definitions.types.input.enabled).toBe(true);
    expect(result.definitions.types.output.enabled).toBe(false);
  });

  it('coerces nested types', () => {
    const normalize = defineConfig({
      definitions: {
        types: {
          infer: {
            $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
            enabled: false,
          },
          input: {
            $coerce: {
              string: (v: string) => ({ enabled: Boolean(v) }),
            },
            $coerceAny: (e: any) => ({ enabled: !e.value }),
            enabled: false,
          },
          output: {
            $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
            enabled: false,
          },
        },
      },
      types: {
        infer: {
          $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
          enabled: false,
        },
        input: {
          enabled: false,
        },
        output: {
          $coerceAny: (e: any) => ({ enabled: Boolean(e.value) }),
          enabled: false,
        },
      },
    });

    const result = normalize({
      definitions: {
        types: {
          infer: true,
          input: 'oh',
          output: false,
        },
      },
      types: {
        infer: true,
        output: {
          enabled: false,
        },
      },
    });

    expect(result.definitions.types.infer.enabled).toBe(true);
    expect(result.definitions.types.input.enabled).toBe(true);
    expect(result.definitions.types.output.enabled).toBe(false);
  });
});
