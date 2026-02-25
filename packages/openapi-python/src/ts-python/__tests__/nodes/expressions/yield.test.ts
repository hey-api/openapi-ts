import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('yield expression', () => {
  it('without value', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('gen', [], undefined, [
        py.factory.createExpressionStatement(py.factory.createYieldExpression(undefined)),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'default.py');
  });

  it('with value', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('gen', [], undefined, [
        py.factory.createExpressionStatement(
          py.factory.createYieldExpression(py.factory.createLiteral(42)),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-value.py');
  });

  it('from expression', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('iterable'),
        undefined,
        py.factory.createListExpression([
          py.factory.createLiteral(1),
          py.factory.createLiteral(2),
          py.factory.createLiteral(3),
        ]),
      ),
      py.factory.createEmptyStatement(),
      py.factory.createFunctionDeclaration('gen', [], undefined, [
        py.factory.createExpressionStatement(
          py.factory.createYieldFromExpression(py.factory.createIdentifier('iterable')),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'from-iterable.py');
  });
});
