import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('f-string expression', () => {
  it('simple interpolation', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('name'),
        undefined,
        py.factory.createLiteral('Joe'),
      ),
      py.factory.createExpressionStatement(
        py.factory.createCallExpression(py.factory.createIdentifier('print'), [
          py.factory.createFStringExpression(['Hello, ', py.factory.createIdentifier('name'), '!']),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple-interpolation.py');
  });

  it('with multiple expressions', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('a'),
        undefined,
        py.factory.createLiteral(1),
      ),
      py.factory.createAssignment(
        py.factory.createIdentifier('b'),
        undefined,
        py.factory.createLiteral(2),
      ),
      py.factory.createExpressionStatement(
        py.factory.createCallExpression(py.factory.createIdentifier('print'), [
          py.factory.createFStringExpression([
            'Sum: ',
            py.factory.createBinaryExpression(
              py.factory.createIdentifier('a'),
              '+',
              py.factory.createIdentifier('b'),
            ),
          ]),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multiple-expressions.py');
  });
});
