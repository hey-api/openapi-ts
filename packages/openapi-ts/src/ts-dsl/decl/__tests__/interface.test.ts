import ts from 'typescript';

import { $ } from '../../';
import { TypePropTsDsl } from '../../type/prop';

function render(node: ts.Node): string {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const sourceFile = ts.createSourceFile(
    'test.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

function prop(name: string, fn: (p: TypePropTsDsl) => void): TypePropTsDsl {
  return new TypePropTsDsl(name, fn);
}

describe('InterfaceTsDsl', () => {
  it('renders empty interface', () => {
    const node = $.interface('Foo').export();
    expect(render(node.toAst())).toBe('export interface Foo {\n}');
  });

  it('renders interface without export', () => {
    const node = $.interface('Foo');
    expect(render(node.toAst())).toBe('interface Foo {\n}');
  });

  it('renders interface with extends', () => {
    const node = $.interface('Foo').export().extends('Bar');
    expect(render(node.toAst())).toBe('export interface Foo extends Bar {\n}');
  });

  it('renders interface with extends and type args', () => {
    const node = $.interface('Foo')
      .export()
      .extends('Bar', [$.type('string'), $.type('number')]);
    expect(render(node.toAst())).toBe('export interface Foo extends Bar<string, number> {\n}');
  });

  it('renders interface with extends using type references', () => {
    const node = $.interface('ShelterFolder')
      .export()
      .extends('ShelterFolderTemplate', [$.type('ShelterFolder'), $.type('ShelterResource')]);
    expect(render(node.toAst())).toBe(
      'export interface ShelterFolder extends ShelterFolderTemplate<ShelterFolder, ShelterResource> {\n}',
    );
  });

  it('renders interface with body members', () => {
    const node = $.interface('Foo')
      .export()
      .do(prop('name', (p) => p.type($.type('string')).optional()));
    expect(render(node.toAst())).toBe('export interface Foo {\n    name?: string;\n}');
  });

  it('renders interface with extends + body + type args (full circular case)', () => {
    const node = $.interface('Branch')
      .export()
      .extends('NodeTemplate', [$.type('Branch')])
      .do(
        prop('name', (p) => p.type($.type('string'))),
        prop('level', (p) => p.type($.type('number')).optional()),
      );
    expect(render(node.toAst())).toBe(
      'export interface Branch extends NodeTemplate<Branch> {\n    name: string;\n    level?: number;\n}',
    );
  });

  it('renders interface with doc comment', () => {
    const node = $.interface('Foo').export().doc(['A description']);
    expect(render(node.toAst())).toBe('/**\n * A description\n */\nexport interface Foo {\n}');
  });

  it('renders interface with own type params', () => {
    const node = $.interface('Mapper')
      .export()
      .generic('T')
      .generic('U')
      .extends('BaseMapper', [$.type('T')]);
    expect(render(node.toAst())).toBe('export interface Mapper<T, U> extends BaseMapper<T> {\n}');
  });

  it('renders interface with multiple extends type args using symbols', () => {
    const node = $.interface('Folder')
      .export()
      .extends('FolderTemplate', [$.type('Folder'), $.type('Resource')])
      .do(
        prop('accessLevel', (p) =>
          p.type(
            $.type.or($.type.literal('public'), $.type.literal('staff'), $.type.literal('admin')),
          ),
        ),
      );
    expect(render(node.toAst())).toBe(
      "export interface Folder extends FolderTemplate<Folder, Resource> {\n    accessLevel: 'public' | 'staff' | 'admin';\n}",
    );
  });
});
