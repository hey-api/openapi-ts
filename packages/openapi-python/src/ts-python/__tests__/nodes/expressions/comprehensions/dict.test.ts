import { py } from '../../../../index';
import { assertPrintedMatchesSnapshot } from '../../utils';

describe('dict comprehension', () => {
  it('assignment', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createFunctionDeclaration(
        'foo',
        [],
        undefined,
        [
          py.factory.createAssignment(
            py.factory.createIdentifier('items'),
            py.factory.createDictExpression([
              {
                key: py.factory.createLiteral('key1'),
                value: py.factory.createLiteral('value1'),
              },
              {
                key: py.factory.createLiteral('key2'),
                value: py.factory.createLiteral('value2'),
              },
            ]),
          ),
          py.factory.createExpressionStatement(
            py.factory.createDictComprehension(
              py.factory.createIdentifier('k'),
              py.factory.createIdentifier('v'),
              py.factory.createTupleExpression([
                py.factory.createIdentifier('k'),
                py.factory.createIdentifier('v'),
              ]),
              py.factory.createCallExpression(
                py.factory.createMemberExpression(
                  py.factory.createIdentifier('items'),
                  py.factory.createIdentifier('items'),
                ),
                [],
              ),
              [
                py.factory.createBinaryExpression(
                  py.factory.createIdentifier('k'),
                  '%',
                  py.factory.createLiteral(2),
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
    await assertPrintedMatchesSnapshot(file, 'dict.py');
  });
});
