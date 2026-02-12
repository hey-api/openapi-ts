import { File } from '../files/file';
import { FileRegistry } from '../files/registry';

const mockProject = {} as any;

describe('FileRegistry', () => {
  it('register() creates a new File with incrementing id', () => {
    const registry = new FileRegistry(mockProject);

    const f1 = registry.register({
      language: 'typescript',
      logicalFilePath: 'foo.ts',
    });
    const f2 = registry.register({
      language: 'typescript',
      logicalFilePath: 'bar.ts',
    });

    expect(f1).toBeInstanceOf(File);
    expect(f2).toBeInstanceOf(File);
    expect(f2.id).toBe(f1.id + 1);
  });

  it('register() updates name if file already exists', () => {
    const registry = new FileRegistry(mockProject);

    const f1 = registry.register({
      language: 'typescript',
      logicalFilePath: 'dup.ts',
      name: 'First',
    });
    const f2 = registry.register({
      language: 'typescript',
      logicalFilePath: 'dup.ts',
      name: 'Second',
    });

    expect(f1).toBe(f2); // same File instance
    expect(f1.name).toBe('Second'); // name updated
  });

  it('get() returns the registered File or undefined', () => {
    const registry = new FileRegistry(mockProject);

    const f = registry.register({ language: 'ts', logicalFilePath: 'get.ts' });

    expect(registry.get({ language: 'ts', logicalFilePath: 'get.ts' })).toBe(f);
    expect(registry.get({ language: 'ts', logicalFilePath: 'missing.ts' })).toBeUndefined();
  });

  it('isRegistered() returns true only for existing files', () => {
    const registry = new FileRegistry(mockProject);

    registry.register({ language: 'ts', logicalFilePath: 'check.ts' });

    expect(registry.isRegistered({ language: 'ts', logicalFilePath: 'check.ts' })).toBe(true);
    expect(registry.isRegistered({ language: 'ts', logicalFilePath: 'other.ts' })).toBe(false);
  });

  it('registered() iterates over all files', () => {
    const registry = new FileRegistry(mockProject);

    const files = [
      registry.register({ language: 'ts', logicalFilePath: 'a.ts' }),
      registry.register({ language: 'ts', logicalFilePath: 'b.ts' }),
    ];

    const iterated = [...registry.registered()];
    expect(iterated).toEqual(files);
  });

  it('handles external flag in key generation', () => {
    const registry = new FileRegistry(mockProject);

    const f1 = registry.register({
      external: true,
      language: 'ts',
      logicalFilePath: 'ext.ts',
    });
    const f2 = registry.register({
      external: false,
      language: 'ts',
      logicalFilePath: 'ext.ts',
    });

    expect(f1).not.toBe(f2);
    expect(
      registry.isRegistered({
        external: true,
        language: 'ts',
        logicalFilePath: 'ext.ts',
      }),
    ).toBe(true);
    expect(
      registry.isRegistered({
        external: false,
        language: 'ts',
        logicalFilePath: 'ext.ts',
      }),
    ).toBe(true);
  });

  it('language influences key generation', () => {
    const registry = new FileRegistry(mockProject);

    const tsFile = registry.register({
      language: 'ts',
      logicalFilePath: 'file',
    });
    const jsFile = registry.register({
      language: 'js',
      logicalFilePath: 'file',
    });

    expect(tsFile).not.toBe(jsFile);
    expect(registry.isRegistered({ language: 'ts', logicalFilePath: 'file' })).toBe(true);
    expect(registry.isRegistered({ language: 'js', logicalFilePath: 'file' })).toBe(true);
  });
});
