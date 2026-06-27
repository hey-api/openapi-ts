import { ts } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

const stringType = ts.factory.createIdentifier('string') as unknown as ts.TypeNode;
const unknownType = ts.factory.createIdentifier('unknown') as unknown as ts.TypeNode;

describe('index-signature', () => {
  it('readonly', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createInterfaceDeclaration(undefined, 'Dictionary', undefined, undefined, [
        ts.factory.createIndexSignature(
          [ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword)],
          [
            ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              'key',
              undefined,
              stringType,
              undefined,
            ),
          ],
          unknownType,
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'readonly.ts');
  });
});
