import { py } from '../../..';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('block statement', () => {
  it('inside function', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('main', [], undefined, [
        py.factory.createExpressionStatement(
          py.factory.createCallExpression(py.factory.createIdentifier('print'), [
            py.factory.createLiteral('inside'),
          ]),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'function.py');
  });
});
