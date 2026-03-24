import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('function declaration', () => {
  it('default', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('greet', [], undefined, []),
    ]);
    await assertPrintedMatchesSnapshot(file, 'default.py');
  });

  it('with docstring', async () => {
    const node = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration(
        'greet',
        [],
        undefined,
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('print'), [
              py.factory.createLiteral('Hello'),
            ]),
          ),
        ],
        undefined,
        'This function prints a greeting.',
      ),
    ]);
    await assertPrintedMatchesSnapshot(node, 'with-docstring.py');
  });

  it('with body', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration(
        'greet',
        [py.factory.createFunctionParameter('name')],
        undefined,
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('print'), [
              py.factory.createIdentifier('name'),
            ]),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-body.py');
  });

  it('with decorators', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration(
        'my_decorator',
        [py.factory.createFunctionParameter('func')],
        undefined,
        [py.factory.createReturnStatement(py.factory.createIdentifier('func'))],
      ),
      py.factory.createEmptyStatement(),
      py.factory.createFunctionDeclaration(
        'another_decorator',
        [py.factory.createFunctionParameter('func')],
        undefined,
        [py.factory.createReturnStatement(py.factory.createIdentifier('func'))],
      ),
      py.factory.createEmptyStatement(),
      py.factory.createFunctionDeclaration(
        'greet',
        [],
        undefined,
        [],
        [
          py.factory.createIdentifier('my_decorator'),
          py.factory.createIdentifier('another_decorator'),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-decorators.py');
  });

  it('with parameter annotations, defaults, and return type', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration(
        'greet',
        [
          py.factory.createFunctionParameter(
            'name',
            py.factory.createIdentifier('str'),
            py.factory.createLiteral('World'),
          ),
          py.factory.createFunctionParameter(
            'times',
            py.factory.createIdentifier('int'),
            py.factory.createLiteral(1),
          ),
        ],
        py.factory.createIdentifier('None'), // returnType
        [
          py.factory.createForStatement(
            py.factory.createIdentifier('i'),
            py.factory.createCallExpression(py.factory.createIdentifier('range'), [
              py.factory.createIdentifier('times'),
            ]),
            [
              py.factory.createExpressionStatement(
                py.factory.createCallExpression(py.factory.createIdentifier('print'), [
                  py.factory.createBinaryExpression(
                    py.factory.createLiteral('Hello, '),
                    '+',
                    py.factory.createIdentifier('name'),
                  ),
                ]),
              ),
            ],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-annotations-defaults-return.py');
  });
});
