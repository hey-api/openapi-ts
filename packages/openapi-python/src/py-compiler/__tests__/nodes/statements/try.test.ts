import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('try statement', () => {
  it('with except', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('dangerous_func', [], undefined, []),
      py.factory.createEmptyStatement(),
      py.factory.createTryStatement(
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('dangerous_func'), []),
          ),
        ],
        [
          py.factory.createExceptClause(
            [
              py.factory.createExpressionStatement(
                py.factory.createCallExpression(py.factory.createIdentifier('print'), [
                  py.factory.createIdentifier('e'),
                ]),
              ),
            ],
            py.factory.createIdentifier('ValueError'),
            py.factory.createIdentifier('e'),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-except.py');
  });

  it('with except and else', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('dangerous_func', [], undefined, []),
      py.factory.createEmptyStatement(),
      py.factory.createTryStatement(
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('dangerous_func'), []),
          ),
        ],
        [py.factory.createExceptClause([])],
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-except-else.py');
  });

  it('with finally', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('dangerous_func', [], undefined, []),
      py.factory.createEmptyStatement(),
      py.factory.createTryStatement(
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('dangerous_func'), []),
          ),
        ],
        undefined,
        undefined,
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-finally.py');
  });

  it('with except and finally', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('dangerous_func', [], undefined, []),
      py.factory.createEmptyStatement(),
      py.factory.createTryStatement(
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('dangerous_func'), []),
          ),
        ],
        [py.factory.createExceptClause([], py.factory.createIdentifier('Exception'))],
        undefined,
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-except-finally.py');
  });

  it('with except, else, and finally', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('dangerous_func', [], undefined, []),
      py.factory.createEmptyStatement(),
      py.factory.createTryStatement(
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('dangerous_func'), []),
          ),
        ],
        [
          py.factory.createExceptClause(
            [
              py.factory.createExpressionStatement(
                py.factory.createCallExpression(py.factory.createIdentifier('print'), [
                  py.factory.createIdentifier('e'),
                ]),
              ),
            ],
            py.factory.createIdentifier('Exception'),
            py.factory.createIdentifier('e'),
          ),
        ],
        [],
        [],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-except-else-finally.py');
  });
});
