import type { SchemaWithType } from '../../../shared/types/schema';
import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const nullToAst = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _args: IrSchemaToAstOptions & {
    schema: SchemaWithType<'null'>;
  },
): Omit<Ast, 'typeName'> => {
  const result: Partial<Omit<Ast, 'typeName'>> = {};
  result.def = identifiers.primitives.null;
  return result as Omit<Ast, 'typeName'>;
};
