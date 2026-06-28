import { ts } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('module-declaration', () => {
  it('exported namespace with variable statement', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createModuleDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier('Config'),
        ts.factory.createModuleBlock([
          ts.factory.createVariableStatement(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createVariableDeclarationList(
              [
                ts.factory.createVariableDeclaration(
                  'version',
                  undefined,
                  undefined,
                  ts.factory.createStringLiteral('1.0.0'),
                ),
              ],
              ts.NodeFlags.Const,
            ),
          ),
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'exported-namespace.ts');
  });
});
