import { describe, it } from 'vitest';

import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('for statement', () => {
  it('simple', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createForStatement(
        py.factory.createIdentifier('i'),
        py.factory.createCallExpression(py.factory.createIdentifier('range'), [
          py.factory.createLiteral(3),
        ]),
        [
          py.factory.createExpressionStatement(
            py.factory.createCallExpression(py.factory.createIdentifier('print'), [
              py.factory.createIdentifier('i'),
            ]),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'for.py');
  });

  it('with else', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('items'),
        py.factory.createListExpression([
          py.factory.createLiteral(1),
          py.factory.createLiteral(2),
          py.factory.createLiteral(3),
        ]),
      ),
      py.factory.createForStatement(
        py.factory.createIdentifier('x'),
        py.factory.createIdentifier('items'),
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
    await assertPrintedMatchesSnapshot(file, 'for-else.py');
  });
});
