import { ts } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('identifier expression', () => {
  it('assignment', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createVariableStatement('let', 'x'),
      ts.factory.createVariableStatement('let', 'y'),
      ts.factory.createAssignment(
        ts.factory.createIdentifier('y'),
        undefined,
        ts.factory.createLiteral(42),
      ),
      ts.factory.createAssignment(
        ts.factory.createIdentifier('x'),
        undefined,
        ts.factory.createIdentifier('y'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'identifier.ts');
  });
});
