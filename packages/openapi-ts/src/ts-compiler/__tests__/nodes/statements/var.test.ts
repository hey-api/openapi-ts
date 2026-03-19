import { ts } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('variable statement', () => {
  it('const', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createVariableStatement('const', 'answer', ts.factory.createLiteral(42)),
    ]);
    await assertPrintedMatchesSnapshot(file, 'const.ts');
  });

  it('let', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createVariableStatement('let', 'message', ts.factory.createLiteral('hello')),
    ]);
    await assertPrintedMatchesSnapshot(file, 'let.ts');
  });

  it('var', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createVariableStatement('var', 'count', ts.factory.createLiteral(0)),
    ]);
    await assertPrintedMatchesSnapshot(file, 'var.ts');
  });
});
