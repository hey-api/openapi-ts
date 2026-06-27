import { ts } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('object-binding-pattern', () => {
  it('shorthand and renamed elements', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createFunctionDeclaration(
        undefined,
        undefined,
        'handler',
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            ts.factory.createObjectBindingPattern([
              ts.factory.createBindingElement(undefined, undefined, 'id'),
              ts.factory.createBindingElement(undefined, 'name', 'label'),
            ]),
          ),
        ],
        undefined,
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList([], ts.NodeFlags.Const),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'shorthand-and-renamed.ts');
  });
});
