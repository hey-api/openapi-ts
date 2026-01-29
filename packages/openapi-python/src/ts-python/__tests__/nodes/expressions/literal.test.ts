import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('literal expression', () => {
  it('primitive variables', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('s'),
        py.factory.createLiteral('hello'),
      ),
      py.factory.createAssignment(py.factory.createIdentifier('n'), py.factory.createLiteral(123)),
      py.factory.createAssignment(py.factory.createIdentifier('b'), py.factory.createLiteral(true)),
      py.factory.createAssignment(
        py.factory.createIdentifier('none'),
        py.factory.createLiteral(null),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'primitive.py');
  });
});
