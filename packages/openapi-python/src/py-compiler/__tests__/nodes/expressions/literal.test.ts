import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('literal expression', () => {
  it('primitive variables', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('s'),
        undefined,
        py.factory.createLiteral('hello'),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('n'),
        undefined,
        py.factory.createLiteral(123),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('b'),
        undefined,
        py.factory.createLiteral(true),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('none'),
        undefined,
        py.factory.createLiteral(null),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'primitive.py');
  });
});
