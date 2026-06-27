import type { TsNodeBase } from '../base';
import type { TsExpressionWithTypeArguments } from '../expressions/expression-with-type-arguments';
import { TsNodeKind } from '../kinds';
import type { TsToken } from '../token';

export interface TsHeritageClause extends TsNodeBase {
  kind: TsNodeKind.HeritageClause;
  token: TsToken;
  types: ReadonlyArray<TsExpressionWithTypeArguments>;
}

export function createHeritageClause(
  token: TsToken,
  types: ReadonlyArray<TsExpressionWithTypeArguments>,
): TsHeritageClause {
  return {
    kind: TsNodeKind.HeritageClause,
    token,
    types,
  };
}
