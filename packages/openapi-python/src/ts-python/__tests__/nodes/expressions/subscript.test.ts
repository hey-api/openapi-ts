import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('subscript expression', () => {
  it('type annotation with single type parameter', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('numbers'),
        undefined,
        py.factory.createSubscriptExpression(
          py.factory.createIdentifier('list'),
          py.factory.createIdentifier('int'),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'single.py');
  });

  it('type annotation with multiple type parameters', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('data'),
        undefined,
        py.factory.createSubscriptExpression(
          py.factory.createIdentifier('dict'),
          py.factory.createSubscriptSlice([
            py.factory.createIdentifier('str'),
            py.factory.createIdentifier('int'),
          ]),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multiple.py');
  });

  it('index access', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('items'),
        undefined,
        py.factory.createTupleExpression([
          py.factory.createLiteral(1),
          py.factory.createLiteral(2),
          py.factory.createLiteral(3),
        ]),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('first'),
        undefined,
        py.factory.createSubscriptExpression(
          py.factory.createIdentifier('items'),
          py.factory.createLiteral(0),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'index-access.py');
  });

  it('nested type annotation', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('matrix'),
        undefined,
        py.factory.createSubscriptExpression(
          py.factory.createIdentifier('list'),
          py.factory.createSubscriptExpression(
            py.factory.createIdentifier('list'),
            py.factory.createIdentifier('int'),
          ),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'nested.py');
  });
});
