import type { ICodegenSymbolOut } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '../../ir/types';
import { tsc } from '../../tsc';
import { createSchemaComment } from '../shared/utils/schema';
import { identifiers } from './constants';
import type { ZodSchema } from './shared/types';
import type { ZodPlugin } from './types';

export const exportZodSchema = ({
  plugin,
  schema,
  symbol,
  typeInferSymbol,
  zodSchema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: IR.SchemaObject;
  symbol: ICodegenSymbolOut;
  typeInferSymbol: ICodegenSymbolOut | undefined;
  zodSchema: ZodSchema;
}) => {
  const f = plugin.gen.ensureFile(plugin.output);

  const zSymbol = plugin.gen.selectSymbolFirstOrThrow(
    plugin.api.getSelector('import', 'zod'),
  );

  const statement = tsc.constVariable({
    comment: plugin.config.comments
      ? createSchemaComment({ schema })
      : undefined,
    exportConst: true,
    expression: zodSchema.expression,
    name: symbol.placeholder,
    typeName: zodSchema.typeName
      ? (tsc.propertyAccessExpression({
          expression: zSymbol.placeholder,
          name: zodSchema.typeName,
        }) as unknown as ts.TypeNode)
      : undefined,
  });
  f.patchSymbol(symbol.id, { value: statement });

  if (typeInferSymbol) {
    const inferType = tsc.typeAliasDeclaration({
      exportType: true,
      name: typeInferSymbol.placeholder,
      type: tsc.typeReferenceNode({
        typeArguments: [
          tsc.typeOfExpression({
            text: symbol.placeholder,
          }) as unknown as ts.TypeNode,
        ],
        typeName: tsc.propertyAccessExpression({
          expression: zSymbol.placeholder,
          name: identifiers.infer,
        }) as unknown as string,
      }),
    });
    f.patchSymbol(typeInferSymbol.id, { value: inferType });
  }
};
