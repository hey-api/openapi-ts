import { moduleSortKey } from '../render-utils';

const createFile = (finalPath: string, external = false) => {
  const parts = finalPath.split('/');
  const filename = parts.at(-1)!;
  const dotIndex = filename.lastIndexOf('.');
  return {
    extension: dotIndex > 0 ? filename.slice(dotIndex) : undefined,
    external,
    finalPath,
    name: dotIndex > 0 ? filename.slice(0, dotIndex) : filename,
  };
};

const root = '/project/src';

describe('moduleSortKey', () => {
  describe('external imports (group 0)', () => {
    it('returns external module path unchanged', () => {
      const file = createFile('/project/src/client.py');
      const fromFile = createFile('httpx', true);

      const [group, distance, modulePath] = moduleSortKey({
        file,
        fromFile,
        preferFileExtension: '.py',
        root,
      });

      expect(group).toBe(0);
      expect(distance).toBe(0);
      expect(modulePath).toBe('httpx');
    });
  });

  describe('local imports (group 2)', () => {
    describe('same directory', () => {
      it('converts sibling file to relative import', () => {
        const file = createFile('/project/src/api/client.py');
        const fromFile = createFile('/project/src/api/types.py');

        const [group, distance, modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(group).toBe(2);
        expect(distance).toBe(0);
        expect(modulePath).toBe('.types');
      });

      it('handles index.py as implicit module', () => {
        const file = createFile('/project/src/api/client.py');
        const fromFile = createFile('/project/src/api/index.py');

        const [, , modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(modulePath).toBe('.');
      });

      it('handles __init__.py as implicit module', () => {
        const file = createFile('/project/src/api/client.py');
        const fromFile = createFile('/project/src/api/__init__.py');

        const [, , modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(modulePath).toBe('.');
      });
    });

    describe('child directory', () => {
      it('converts nested path to dotted module', () => {
        const file = createFile('/project/src/client.py');
        const fromFile = createFile('/project/src/models/user.py');

        const [group, distance, modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(group).toBe(2);
        expect(distance).toBe(0);
        expect(modulePath).toBe('.models.user');
      });

      it('handles deeply nested paths', () => {
        const file = createFile('/project/src/client.py');
        const fromFile = createFile('/project/src/api/v1/endpoints/users.py');

        const [, , modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(modulePath).toBe('.api.v1.endpoints.users');
      });

      it('handles index.py in child directory', () => {
        const file = createFile('/project/src/client.py');
        const fromFile = createFile('/project/src/models/index.py');

        const [, , modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(modulePath).toBe('.models');
      });
    });

    describe('parent directory', () => {
      it('converts single parent traversal', () => {
        const file = createFile('/project/src/api/client.py');
        const fromFile = createFile('/project/src/types.py');

        const [group, distance, modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(group).toBe(2);
        expect(distance).toBe(1);
        expect(modulePath).toBe('..types');
      });

      it('converts double parent traversal', () => {
        const file = createFile('/project/src/api/v1/client.py');
        const fromFile = createFile('/project/src/types.py');

        const [, distance, modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(distance).toBe(2);
        expect(modulePath).toBe('...types');
      });

      it('handles index.py in parent directory', () => {
        const file = createFile('/project/src/api/client.py');
        const fromFile = createFile('/project/src/index.py');

        const [, , modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(modulePath).toBe('..');
      });
    });

    describe('sibling directory', () => {
      it('converts sibling directory path', () => {
        const file = createFile('/project/src/api/client.py');
        const fromFile = createFile('/project/src/models/user.py');

        const [, distance, modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(distance).toBe(1);
        expect(modulePath).toBe('..models.user');
      });

      it('handles index.py in sibling directory', () => {
        const file = createFile('/project/src/api/client.py');
        const fromFile = createFile('/project/src/models/index.py');

        const [, , modulePath] = moduleSortKey({
          file,
          fromFile,
          preferFileExtension: '.py',
          root,
        });

        expect(modulePath).toBe('..models');
      });
    });
  });
});
