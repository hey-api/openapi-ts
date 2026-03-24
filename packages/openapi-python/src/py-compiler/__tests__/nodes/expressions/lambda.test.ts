import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('lambda expression', () => {
  it('simple', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('x'),
        undefined,
        py.factory.createLiteral(5),
      ),
      py.factory.createExpressionStatement(
        py.factory.createLambdaExpression(
          [],
          py.factory.createBinaryExpression(
            py.factory.createIdentifier('x'),
            '+',
            py.factory.createLiteral(1),
          ),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.py');
  });

  it('with parameters and default', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createExpressionStatement(
        py.factory.createLambdaExpression(
          [
            py.factory.createFunctionParameter('x'),
            py.factory.createFunctionParameter('y', undefined, py.factory.createLiteral(10)),
          ],
          py.factory.createBinaryExpression(
            py.factory.createIdentifier('x'),
            '*',
            py.factory.createIdentifier('y'),
          ),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-params-and-default.py');
  });
});
