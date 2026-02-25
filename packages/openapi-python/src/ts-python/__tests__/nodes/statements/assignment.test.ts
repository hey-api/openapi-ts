import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('assignment statement', () => {
  it('primitive variables', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('foo'),
        undefined,
        py.factory.createLiteral(42),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'primitive.py');
  });

  it('annotation only', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('name'),
        py.factory.createIdentifier('str'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'annotation-only.py');
  });

  it('annotation with value', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('name'),
        py.factory.createIdentifier('str'),
        py.factory.createLiteral('default'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'annotation-with-value.py');
  });

  it('optional annotation', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('name'),
        py.factory.createSubscriptExpression(
          py.factory.createIdentifier('Optional'),
          py.factory.createIdentifier('str'),
        ),
        py.factory.createIdentifier('None'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'optional-annotation.py');
  });

  it('complex type annotation', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('items'),
        py.factory.createSubscriptExpression(
          py.factory.createIdentifier('List'),
          py.factory.createIdentifier('str'),
        ),
        py.factory.createCallExpression(py.factory.createIdentifier('Field'), [
          py.factory.createIdentifier('...'),
          py.factory.createKeywordArgument('min_length', py.factory.createLiteral(1)),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'complex-annotation.py');
  });
});
