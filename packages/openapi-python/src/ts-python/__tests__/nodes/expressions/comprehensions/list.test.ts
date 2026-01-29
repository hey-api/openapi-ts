import { describe, it } from 'vitest';

import { py } from '../../../../index';
import { assertPrintedMatchesSnapshot } from '../../utils';

describe('list comprehension', () => {
  it('assignment', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration(
        'foo',
        [],
        undefined,
        [
          py.factory.createAssignment(
            py.factory.createIdentifier('items'),
            py.factory.createListExpression([
              py.factory.createLiteral(1),
              py.factory.createLiteral(2),
              py.factory.createLiteral(3),
            ]),
          ),
          py.factory.createAssignment(
            py.factory.createIdentifier('evens'),
            py.factory.createListComprehension(
              py.factory.createIdentifier('x'),
              py.factory.createIdentifier('x'),
              py.factory.createIdentifier('items'),
              [
                py.factory.createBinaryExpression(
                  py.factory.createBinaryExpression(
                    py.factory.createIdentifier('x'),
                    '%',
                    py.factory.createLiteral(2),
                  ),
                  '==',
                  py.factory.createLiteral(0),
                ),
              ],
              true,
            ),
          ),
        ],
        undefined,
        undefined,
        [py.factory.createIdentifier('async')],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'list.py');
  });
});
