import type { TsIdentifier } from './expressions/identifier';
import type { TsLiteral } from './expressions/literal';

export type TsExpression = TsIdentifier | TsLiteral;
