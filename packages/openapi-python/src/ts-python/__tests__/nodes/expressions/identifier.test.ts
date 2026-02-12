import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('identifier expression', () => {
  it('assignment', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('y'), py.factory.createLiteral(42)),
      py.factory.createAssignment(
        py.factory.createIdentifier('x'),
        py.factory.createIdentifier('y'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'identifier.py');
  });
});
