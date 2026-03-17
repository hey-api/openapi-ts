import { py } from '../../../../index';
import { assertPrintedMatchesSnapshot } from '../../utils';

describe('set comprehension', () => {
  it('assignment', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration(
        'foo',
        [],
        undefined,
        [
          py.factory.createAssignment(
            py.factory.createIdentifier('items'),
            undefined,
            py.factory.createListExpression([
              py.factory.createLiteral(1),
              py.factory.createLiteral(2),
              py.factory.createLiteral(3),
            ]),
          ),
          py.factory.createAssignment(
            py.factory.createIdentifier('unique_evens'),
            undefined,
            py.factory.createSetComprehension(
              py.factory.createIdentifier('x'),
              py.factory.createIdentifier('x'),
              py.factory.createIdentifier('items'),
              [
                py.factory.createBinaryExpression(
                  py.factory.createIdentifier('x'),
                  '%',
                  py.factory.createLiteral(2),
                ),
              ],
            ),
          ),
        ],
        undefined,
        undefined,
        [py.factory.createIdentifier('async')],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'dict.py');
  });
});
