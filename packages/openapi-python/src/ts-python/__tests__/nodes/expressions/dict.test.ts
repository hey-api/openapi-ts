import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('dict expression', () => {
  it('assignment', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('person'),
        py.factory.createDictExpression([
          {
            key: py.factory.createLiteral('name'),
            value: py.factory.createLiteral('Alice'),
          },
          {
            key: py.factory.createLiteral('age'),
            value: py.factory.createLiteral(30),
          },
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'dict.py');
  });
});
