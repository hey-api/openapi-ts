import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('source file', () => {
  it('simple', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('a'), py.factory.createLiteral(1)),
      py.factory.createAssignment(py.factory.createIdentifier('b'), py.factory.createLiteral(2)),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.py');
  });

  it('with docstring', async () => {
    const file = py.factory.createSourceFile(
      [
        py.factory.createAssignment(
          py.factory.createIdentifier('foo'),
          py.factory.createLiteral(1),
        ),
      ],
      'This is a module-level docstring.',
    );
    await assertPrintedMatchesSnapshot(file, 'with-docstring.py');
  });
});
