import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('class declaration', () => {
  it('default', async () => {
    const file = py.factory.createSourceFile([py.factory.createClassDeclaration('MyClass', [])]);
    await assertPrintedMatchesSnapshot(file, 'default.py');
  });

  it('with docstring', async () => {
    const node = py.factory.createSourceFile([
      py.factory.createClassDeclaration(
        'MyClass',
        [],
        undefined,
        undefined,
        'This is a class docstring',
      ),
    ]);
    await assertPrintedMatchesSnapshot(node, 'with-docstring.py');
  });

  it('with base class', async () => {
    const node = py.factory.createSourceFile([
      py.factory.createClassDeclaration('BaseClass', []),
      py.factory.createEmptyStatement(),
      py.factory.createClassDeclaration('MyClass', [], undefined, [
        py.factory.createIdentifier('BaseClass'),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(node, 'with-extends.py');
  });

  it('with method', async () => {
    const node = py.factory.createSourceFile([
      py.factory.createClassDeclaration('MyClass', [
        py.factory.createFunctionDeclaration('foo', [], undefined, [
          py.factory.createReturnStatement(py.factory.createLiteral(42)),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(node, 'with-method.py');
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
      py.factory.createClassDeclaration(
        'MyClass',
        [],
        [
          py.factory.createIdentifier('my_decorator'),
          py.factory.createIdentifier('another_decorator'),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-decorators.py');
  });

  it('with method docstring', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createClassDeclaration('MyClass', [
        py.factory.createFunctionDeclaration(
          'greet',
          [],
          undefined,
          [],
          undefined,
          'Greets the user.',
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-method-docstring.py');
  });
});
