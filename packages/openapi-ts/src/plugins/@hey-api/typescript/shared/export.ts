import type { NodeName, Symbol as CodegenSymbol } from '@hey-api/codegen-core';
import { buildSymbolIn, pathToName } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { createSchemaComment } from '../../../../plugins/shared/utils/schema';
import { $ } from '../../../../ts-dsl';
import { TypeAndTsDsl } from '../../../../ts-dsl/type/and';
import { TypeAttrTsDsl } from '../../../../ts-dsl/type/attr';
import { TypeExprTsDsl } from '../../../../ts-dsl/type/expr';
import { TypeObjectTsDsl } from '../../../../ts-dsl/type/object';
import { exportEnumAst } from './enum';
import type { ProcessorContext } from './processor';
import type { TypeScriptFinal } from './types';

export function exportAst({
  final,
  meta,
  naming,
  namingAnchor,
  path,
  plugin,
  schema,
  tags,
}: Pick<
  ProcessorContext,
  'meta' | 'naming' | 'namingAnchor' | 'path' | 'plugin' | 'schema' | 'tags'
> & {
  final: TypeScriptFinal;
}): void {
  const $ref = meta.resourceId || pathToJsonPointer(path);
  const name = pathToName(path, { anchor: namingAnchor });

  if (
    exportEnumAst({
      enumData: final.enumData,
      name,
      plugin,
      resourceId: $ref,
      schema,
    })
  ) {
    return;
  }

  const symbol = plugin.registerSymbol(
    buildSymbolIn({
      meta: {
        category: 'type',
        path,
        resource: 'definition',
        resourceId: $ref,
        tags,
        tool: 'typescript',
      },
      name,
      naming,
      plugin,
      schema,
    }),
  );

  if (schema.circularTypeAlias && final.type instanceof TypeAndTsDsl) {
    const comment = plugin.config.comments && createSchemaComment(schema);
    const iface = exportCircularInterfaceAst({
      comment,
      final,
      symbol,
    });
    plugin.node(iface);
    return;
  }

  const node = $.type
    .alias(symbol)
    .export()
    .$if(plugin.config.comments && createSchemaComment(schema), (t, v) => t.doc(v))
    .type(final.type);

  if (schema.typeParams?.length) {
    for (const param of schema.typeParams) {
      node.generic(param.paramName);
    }
  }

  plugin.node(node);
}

function exportCircularInterfaceAst({
  comment,
  final,
  symbol,
}: {
  comment: false | ReadonlyArray<string> | undefined;
  final: TypeScriptFinal;
  symbol: CodegenSymbol;
}) {
  const andType = final.type as TypeAndTsDsl;
  const types = andType.getTypes();

  let extendsName: NodeName | undefined;
  const extendsTypeArgs: Array<ReturnType<TypeExprTsDsl['getTypeArgs']>[number]> = [];
  const body: ReturnType<TypeObjectTsDsl['getProps']> = [];

  for (const t of types) {
    if (t instanceof TypeExprTsDsl) {
      const input = t.getExprInput();
      if (input !== undefined && !(input instanceof TypeAttrTsDsl)) {
        extendsName = input as NodeName;
      }
      extendsTypeArgs.push(...t.getTypeArgs());
    } else if (t instanceof TypeObjectTsDsl) {
      body.push(...t.getProps());
    }
  }

  const iface = $.interface(symbol)
    .export()
    .$if(comment, (t, v) => t.doc(v));

  if (extendsName) {
    iface.extends(extendsName, extendsTypeArgs);
  }

  if (body.length) {
    iface.do(...body);
  }

  return iface;
}
