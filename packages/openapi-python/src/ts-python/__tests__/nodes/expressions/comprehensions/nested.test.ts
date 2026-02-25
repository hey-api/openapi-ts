import { py } from '../../../../index';
import { assertPrintedMatchesSnapshot } from '../../utils';

describe('nested comprehension', () => {
  it('dict and list', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('data'),
        undefined,
        py.factory.createDictExpression([
          {
            key: py.factory.createLiteral('numbers'),
            value: py.factory.createListExpression([
              py.factory.createLiteral(1),
              py.factory.createLiteral(2),
              py.factory.createLiteral(3),
            ]),
          },
          {
            key: py.factory.createLiteral('nestedDict'),
            value: py.factory.createDictExpression([
              {
                key: py.factory.createLiteral('foo'),
                value: py.factory.createLiteral('bar'),
              },
            ]),
          },
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'dict-list.py');
  });
});
