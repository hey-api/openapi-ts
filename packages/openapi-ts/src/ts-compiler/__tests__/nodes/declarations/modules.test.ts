import { ts } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('modules', () => {
  it('default import', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(undefined, ts.factory.createIdentifier('React'), undefined),
        ts.factory.createStringLiteral('react'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'default-import.ts');
  });

  it('side effect import', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createImportDeclaration(
        undefined,
        undefined,
        ts.factory.createStringLiteral('./styles.css'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'side-effect-import.ts');
  });

  it('named imports', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          undefined,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              undefined,
              undefined,
              ts.factory.createIdentifier('useState'),
            ),
            ts.factory.createImportSpecifier(
              undefined,
              ts.factory.createIdentifier('useEffect'),
              ts.factory.createIdentifier('effect'),
            ),
          ]),
        ),
        ts.factory.createStringLiteral('react'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'named-imports.ts');
  });

  it('type only named import', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          ts.factory.createToken(ts.SyntaxKind.TypeKeyword),
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              undefined,
              undefined,
              ts.factory.createIdentifier('Config'),
            ),
          ]),
        ),
        ts.factory.createStringLiteral('./types'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'type-only-named-import.ts');
  });

  it('namespace import', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          undefined,
          undefined,
          ts.factory.createNamespaceImport(ts.factory.createIdentifier('path')),
        ),
        ts.factory.createStringLiteral('node:path'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'namespace-import.ts');
  });

  it('default and named imports', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          undefined,
          ts.factory.createIdentifier('React'),
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              undefined,
              undefined,
              ts.factory.createIdentifier('useState'),
            ),
          ]),
        ),
        ts.factory.createStringLiteral('react'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'default-and-named-imports.ts');
  });

  it('named exports', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createExportDeclaration(
        undefined,
        undefined,
        ts.factory.createNamedExports([
          ts.factory.createExportSpecifier(
            undefined,
            undefined,
            ts.factory.createIdentifier('foo'),
          ),
          ts.factory.createExportSpecifier(
            undefined,
            ts.factory.createIdentifier('bar'),
            ts.factory.createIdentifier('baz'),
          ),
        ]),
        undefined,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'named-exports.ts');
  });

  it('re-export named', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createExportDeclaration(
        undefined,
        undefined,
        ts.factory.createNamedExports([
          ts.factory.createExportSpecifier(
            undefined,
            undefined,
            ts.factory.createIdentifier('foo'),
          ),
        ]),
        ts.factory.createStringLiteral('./foo'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 're-export-named.ts');
  });

  it('export star', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createExportDeclaration(
        undefined,
        undefined,
        undefined,
        ts.factory.createStringLiteral('./utils'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'export-star.ts');
  });

  it('namespace export', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createExportDeclaration(
        undefined,
        undefined,
        ts.factory.createNamespaceExport(ts.factory.createIdentifier('utils')),
        ts.factory.createStringLiteral('./utils'),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'namespace-export.ts');
  });

  it('type only export', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createExportDeclaration(
        undefined,
        ts.factory.createToken(ts.SyntaxKind.TypeKeyword),
        ts.factory.createNamedExports([
          ts.factory.createExportSpecifier(
            undefined,
            undefined,
            ts.factory.createIdentifier('Config'),
          ),
        ]),
        undefined,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'type-only-export.ts');
  });

  it('inline type export specifier', async () => {
    const file = ts.factory.createSourceFile([
      ts.factory.createExportDeclaration(
        undefined,
        undefined,
        ts.factory.createNamedExports([
          ts.factory.createExportSpecifier(
            ts.factory.createToken(ts.SyntaxKind.TypeKeyword),
            undefined,
            ts.factory.createIdentifier('Config'),
          ),
        ]),
        undefined,
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'inline-type-export-specifier.ts');
  });
});
