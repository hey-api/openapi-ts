import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('tuple expression', () => {
  it('assignment', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('t'),
        undefined,
        py.factory.createTupleExpression([
          py.factory.createLiteral(1),
          py.factory.createLiteral(2),
          py.factory.createLiteral(3),
        ]),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('single'),
        undefined,
        py.factory.createTupleExpression([py.factory.createLiteral(42)]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'tuple.py');
  });
});
