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
  describe('__future__ imports (group 0)', () => {
    it('sorts __future__ before all other imports', () => {
      const file = createFile('/project/src/client.py');
      const fromFile = createFile('__future__', true);

      const [group, distance, modulePath] = moduleSortKey({
        file,
        fromFile,
        preferFileExtension: '.py',
        root,
      });

      expect(group).toBe(0);
      expect(distance).toBe(0);
      expect(modulePath).toBe('__future__');
    });
  });

  describe('stdlib imports (group 1)', () => {
    it('recognises a top-level stdlib module', () => {
      const file = createFile('/project/src/client.py');
      const fromFile = createFile('typing', true);

      const [group, distance, modulePath] = moduleSortKey({
        file,
        fromFile,
        preferFileExtension: '.py',
        root,
      });

      expect(group).toBe(1);
      expect(distance).toBe(0);
      expect(modulePath).toBe('typing');
    });

    it('recognises a dotted stdlib import by top-level name', () => {
      const file = createFile('/project/src/client.py');
      const fromFile = createFile('collections.abc', true);

      const [group, distance, modulePath] = moduleSortKey({
        file,
        fromFile,
        preferFileExtension: '.py',
        root,
      });

      expect(group).toBe(1);
      expect(distance).toBe(0);
      expect(modulePath).toBe('collections.abc');
    });

    it('sorts stdlib modules correctly (uuid, typing)', () => {
      const file = createFile('/project/src/client.py');

      const [groupTyping] = moduleSortKey({
        file,
        fromFile: createFile('typing', true),
        preferFileExtension: '.py',
        root,
      });

      const [groupUuid] = moduleSortKey({
        file,
        fromFile: createFile('uuid', true),
        preferFileExtension: '.py',
        root,
      });

      expect(groupTyping).toBe(1);
      expect(groupUuid).toBe(1);
    });
  });

  describe('third-party imports (group 2)', () => {
    it('returns third-party module path unchanged', () => {
      const file = createFile('/project/src/client.py');
      const fromFile = createFile('pydantic', true);

      const [group, distance, modulePath] = moduleSortKey({
        file,
        fromFile,
        preferFileExtension: '.py',
        root,
      });

      expect(group).toBe(2);
      expect(distance).toBe(0);
      expect(modulePath).toBe('pydantic');
    });

    it('returns dotted third-party module path unchanged', () => {
      const file = createFile('/project/src/client.py');
      const fromFile = createFile('pydantic.fields', true);

      const [group, distance, modulePath] = moduleSortKey({
        file,
        fromFile,
        preferFileExtension: '.py',
        root,
      });

      expect(group).toBe(2);
      expect(distance).toBe(0);
      expect(modulePath).toBe('pydantic.fields');
    });

    it('treats typing_extensions as third-party', () => {
      const file = createFile('/project/src/client.py');
      const fromFile = createFile('typing_extensions', true);

      const [group] = moduleSortKey({
        file,
        fromFile,
        preferFileExtension: '.py',
        root,
      });

      expect(group).toBe(2);
    });
  });

  describe('local imports (group 4)', () => {
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

        expect(group).toBe(4);
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

        expect(group).toBe(4);
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

        expect(group).toBe(4);
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

  describe('group ordering', () => {
    it('orders groups: __future__ < stdlib < third-party < local', () => {
      const file = createFile('/project/src/client.py');

      const [gFuture] = moduleSortKey({
        file,
        fromFile: createFile('__future__', true),
        preferFileExtension: '.py',
        root,
      });
      const [gStdlib] = moduleSortKey({
        file,
        fromFile: createFile('typing', true),
        preferFileExtension: '.py',
        root,
      });
      const [gThirdParty] = moduleSortKey({
        file,
        fromFile: createFile('pydantic', true),
        preferFileExtension: '.py',
        root,
      });
      const [gLocal] = moduleSortKey({
        file,
        fromFile: createFile('/project/src/models/user.py'),
        preferFileExtension: '.py',
        root,
      });

      expect(gFuture).toBeLessThan(gStdlib);
      expect(gStdlib).toBeLessThan(gThirdParty);
      expect(gThirdParty).toBeLessThan(gLocal);
    });
  });
});
