import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('keyword argument expression', () => {
  it('string value', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('result'),
        undefined,
        py.factory.createCallExpression(py.factory.createIdentifier('func'), [
          py.factory.createKeywordArgument('name', py.factory.createLiteral('test')),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'string.py');
  });

  it('number value', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('result'),
        undefined,
        py.factory.createCallExpression(py.factory.createIdentifier('func'), [
          py.factory.createKeywordArgument('count', py.factory.createLiteral(42)),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'number.py');
  });

  it('multiple keyword arguments', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(
        py.factory.createIdentifier('result'),
        undefined,
        py.factory.createCallExpression(py.factory.createIdentifier('Field'), [
          py.factory.createIdentifier('...'),
          py.factory.createKeywordArgument('min_length', py.factory.createLiteral(1)),
          py.factory.createKeywordArgument('max_length', py.factory.createLiteral(100)),
          py.factory.createKeywordArgument('description', py.factory.createLiteral('A field')),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multiple.py');
  });
});
