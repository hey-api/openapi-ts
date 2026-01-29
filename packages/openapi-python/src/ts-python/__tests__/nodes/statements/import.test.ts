import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('import statement', () => {
  it('module', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createImportStatement('math'),
      py.factory.createImportStatement('json', [{ name: 'loads' }], false),
    ]);
    await assertPrintedMatchesSnapshot(file, 'module.py');
  });

  it('module with alias', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createImportStatement('json', [{ alias: 'js', name: 'json' }], false),
    ]);
    await assertPrintedMatchesSnapshot(file, 'module-with-alias.py');
  });

  it('from with name and alias', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createImportStatement(
        'os',
        [{ name: 'path' }, { alias: 'env', name: 'environ' }],
        true,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'from-with-name-alias.py');
  });

  it('from with alias', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createImportStatement('os', [{ alias: 'env', name: 'environ' }], true),
    ]);
    await assertPrintedMatchesSnapshot(file, 'from-with-alias.py');
  });

  it('from with name', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createImportStatement('sys', [{ name: 'argv' }], true),
    ]);
    await assertPrintedMatchesSnapshot(file, 'from-with-name.py');
  });

  it('from with asterisk', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createImportStatement('collections', [], true),
    ]);
    await assertPrintedMatchesSnapshot(file, 'from-with-asterisk.py');
  });
});
