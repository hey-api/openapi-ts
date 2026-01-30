import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('assignment statement', () => {
  it('primitive variables', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('foo'), py.factory.createLiteral(42)),
    ]);
    await assertPrintedMatchesSnapshot(file, 'primitive.py');
  });
});
