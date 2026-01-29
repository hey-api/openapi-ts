import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('set expression', () => {
  it('assignment', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('foo'),
        py.factory.createLiteral('bar'),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('emptySet'),
        py.factory.createSetExpression([]),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('numberSet'),
        py.factory.createSetExpression([
          py.factory.createLiteral(1),
          py.factory.createLiteral(2),
          py.factory.createLiteral(3),
        ]),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('mixedSet'),
        py.factory.createSetExpression([
          py.factory.createLiteral('a'),
          py.factory.createLiteral(true),
          py.factory.createIdentifier('foo'),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'set.py');
  });
});
