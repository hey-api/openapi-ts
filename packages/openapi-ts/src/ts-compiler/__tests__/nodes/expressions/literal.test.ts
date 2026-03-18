import { ts } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('literal expression', () => {
  it('primitive variables', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createVariableStatement('let', 's'),
      ts.factory.createVariableStatement('let', 'n'),
      ts.factory.createVariableStatement('let', 'b'),
      ts.factory.createVariableStatement('let', 'c'),
      ts.factory.createVariableStatement('let', 'none'),
      ts.factory.createAssignment(
        ts.factory.createIdentifier('s'),
        undefined,
        ts.factory.createLiteral('hello'),
      ),
      ts.factory.createAssignment(
        ts.factory.createIdentifier('n'),
        undefined,
        ts.factory.createLiteral(123),
      ),
      ts.factory.createAssignment(
        ts.factory.createIdentifier('b'),
        undefined,
        ts.factory.createLiteral(true),
      ),
      ts.factory.createAssignment(
        ts.factory.createIdentifier('c'),
        undefined,
        ts.factory.createLiteral(false),
      ),
      ts.factory.createAssignment(
        ts.factory.createIdentifier('none'),
        undefined,
        ts.factory.createLiteral(null),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'primitive.ts');
  });
});
