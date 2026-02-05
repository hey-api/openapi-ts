import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('while statement', () => {
  it('simple', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('x'), py.factory.createLiteral(3)),
      py.factory.createWhileStatement(
        py.factory.createBinaryExpression(
          py.factory.createIdentifier('x'),
          '>',
          py.factory.createLiteral(0),
        ),
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('print'), [
              py.factory.createIdentifier('x'),
            ]),
          ),
          py.factory.createAssignment(
            py.factory.createIdentifier('x'),
            py.factory.createBinaryExpression(
              py.factory.createIdentifier('x'),
              '-',
              py.factory.createLiteral(1),
            ),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'while.py');
  });

  it('with else', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('should_continue', [], undefined, [
        py.factory.createReturnStatement(py.factory.createLiteral(false)),
      ]),
      py.factory.createWhileStatement(
        py.factory.createCallExpression(py.factory.createIdentifier('should_continue'), []),
        [],
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('print'), [
              py.factory.createLiteral('done'),
            ]),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'while-else.py');
  });
});
