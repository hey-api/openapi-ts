import { log } from '@hey-api/codegen-core';

import { warnOnConflictingDuplicatePlugins } from '../duplicate';

describe('warnOnConflictingDuplicatePlugins', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const warningMessage =
    'Plugin "@hey-api/client-fetch" is configured multiple times. Only the last instance will take effect.';

  it('does not warn for duplicate string plugins', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins(['@hey-api/client-fetch', '@hey-api/client-fetch']);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn for duplicate plugins with identical config in different key order', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins([
      {
        foo: 'bar',
        name: '@hey-api/client-fetch',
        output: 'sdk',
      },
      {
        output: 'sdk',
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        foo: 'bar',
        name: '@hey-api/client-fetch',
      },
    ]);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn when a string and an object with only name are specified', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins(['@hey-api/client-fetch', { name: '@hey-api/client-fetch' }]);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn for duplicate plugins with identical object config', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins([
      {
        foo: 'bar',
        name: '@hey-api/client-fetch',
      },
      {
        foo: 'bar',
        name: '@hey-api/client-fetch',
      },
    ]);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn when nested object configs differ only in key order', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins([
      {
        definitions: { case: 'PascalCase', name: 'foo' },
        name: '@hey-api/client-fetch',
      },
      {
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        definitions: { name: 'foo', case: 'PascalCase' },
        name: '@hey-api/client-fetch',
      },
    ]);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns for duplicate plugins with conflicting config', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins([
      {
        foo: 'bar',
        name: '@hey-api/client-fetch',
      },
      {
        foo: 'baz',
        name: '@hey-api/client-fetch',
      },
    ]);

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(warningMessage);
  });

  it('warns when a string plugin conflicts with an object plugin of the same name', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins([
      '@hey-api/client-fetch',
      {
        name: '@hey-api/client-fetch',
        output: 'sdk',
      },
    ]);

    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('does not warn when array-valued options differ only in element key order', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins([
      {
        items: [{ from: 'foo', name: 'bar' }],
        name: '@hey-api/client-fetch',
      },
      {
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        items: [{ name: 'bar', from: 'foo' }],
        name: '@hey-api/client-fetch',
      },
    ]);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when array-valued options differ in element order', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins([
      {
        items: [
          { from: 'a', name: 'x' },
          { from: 'b', name: 'y' },
        ],
        name: '@hey-api/client-fetch',
      },
      {
        items: [
          { from: 'b', name: 'y' },
          { from: 'a', name: 'x' },
        ],
        name: '@hey-api/client-fetch',
      },
    ]);

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(warningMessage);
  });

  it('does not warn when function-valued options have identical source', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});
    const transform = (value: string) => value.toUpperCase();

    warnOnConflictingDuplicatePlugins([
      {
        definitions: { name: transform },
        name: '@hey-api/client-fetch',
      },
      {
        definitions: { name: transform },
        name: '@hey-api/client-fetch',
      },
    ]);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns when function-valued options differ', () => {
    const warnSpy = vi.spyOn(log, 'warn').mockImplementation(() => {});

    warnOnConflictingDuplicatePlugins([
      {
        definitions: { name: (value: string) => value.toUpperCase() },
        name: '@hey-api/client-fetch',
      },
      {
        definitions: { name: (value: string) => value.toLowerCase() },
        name: '@hey-api/client-fetch',
      },
    ]);

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(warningMessage);
  });
});
