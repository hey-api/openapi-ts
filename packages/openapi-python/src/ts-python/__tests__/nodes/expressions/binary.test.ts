import { py } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('binary expression', () => {
  it('add', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('a'), py.factory.createLiteral(42)),
      py.factory.createAssignment(py.factory.createIdentifier('b'), py.factory.createLiteral(84)),
      py.factory.createAssignment(
        py.factory.createIdentifier('z'),
        py.factory.createBinaryExpression(
          py.factory.createIdentifier('a'),
          '+',
          py.factory.createIdentifier('b'),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'add.py');
  });

  it('subtract', async () => {
    const file = py.factory.createSourceFile([
      py.factory.createAssignment(py.factory.createIdentifier('a'), py.factory.createLiteral(42)),
      py.factory.createAssignment(py.factory.createIdentifier('b'), py.factory.createLiteral(84)),
      py.factory.createAssignment(
        py.factory.createIdentifier('z'),
        py.factory.createBinaryExpression(
          py.factory.createIdentifier('a'),
          '-',
          py.factory.createIdentifier('b'),
        ),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'subtract.py');
  });
});
