import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('return statement', () => {
  it('inside function', async () => {
    const node = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('get_message', [], undefined, [
        py.factory.createReturnStatement(py.factory.createLiteral('hi')),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(node, 'function.py');
  });
});
