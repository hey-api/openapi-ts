import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('if statement', () => {
  it('simple', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createIfStatement(py.factory.createLiteral(true), [
        py.factory.createExpressionStatement(
          py.factory.createCallExpression(py.factory.createIdentifier('print'), [
            py.factory.createLiteral('positive'),
          ]),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'if.py');
  });

  it('with else', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('x'), py.factory.createLiteral(0)),
      py.factory.createIfStatement(
        py.factory.createBinaryExpression(
          py.factory.createIdentifier('x'),
          '>',
          py.factory.createLiteral(0),
        ),
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('print'), [
              py.factory.createLiteral('positive'),
            ]),
          ),
        ],
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('print'), [
              py.factory.createLiteral('non-positive'),
            ]),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'if-else.py');
  });
});
