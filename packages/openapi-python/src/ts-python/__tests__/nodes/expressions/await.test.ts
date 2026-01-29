import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('await expression', () => {
  it('inside async function', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration('fetchData', [], undefined, []),
      py.factory.createEmptyStatement(),
      py.factory.createFunctionDeclaration(
        'main',
        [],
        undefined,
        [
          py.factory.createExpressionStatement(
            py.factory.createAwaitExpression(
              py.factory.createCallExpression(py.factory.createIdentifier('fetchData'), []),
            ),
          ),
        ],
        undefined,
        undefined,
        [py.factory.createIdentifier('async')],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'inside-function.py');
  });
});
