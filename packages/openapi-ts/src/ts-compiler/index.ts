import type { TsNode as _TsNode, TsNodeBase as _TsNodeBase } from './nodes/base';
import type { TsExpression as _TsExpression } from './nodes/expression';
import type { TsIdentifier as _TsIdentifier } from './nodes/expressions/identifier';
import type {
  TsLiteral as _TsLiteral,
  TsLiteralValue as _TsLiteralValue,
} from './nodes/expressions/literal';
import { factory } from './nodes/factory';
import { TsNodeKind } from './nodes/kinds';
import type { TsStatement as _TsStatement } from './nodes/statement';
import type { TsAssignment as _TsAssignment } from './nodes/statements/assignment';
import type { TsVariableStatement as _TsVariableStatement } from './nodes/statements/var';
import type { TsSourceFile } from './nodes/structure/sourceFile';
import type { TsType as _TsType } from './nodes/type';
import type { TsPrinterOptions as _TsPrinterOptions } from './printer';
import { createPrinter, printAst } from './printer';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ts {
  // Base / Core
  export type Node = _TsNode;
  export type NodeBase = _TsNodeBase;
  export type NodeKind = TsNodeKind;
  export type Expression = _TsExpression;
  export type Statement = _TsStatement;
  export type Type = _TsType;

  // Structure
  export type SourceFile = TsSourceFile;

  // Declarations
  // ...

  // Statements
  export type Assignment = _TsAssignment;
  export type VariableStatement = _TsVariableStatement;

  // Expressions
  export type Identifier = _TsIdentifier;
  export type Literal = _TsLiteral;

  // Printer
  export type PrinterOptions = _TsPrinterOptions;

  // Miscellaneous
  export type LiteralValue = _TsLiteralValue;
}

export const ts = {
  TsNodeKind,
  createPrinter,
  factory,
  printAst,
} as const;

export { factory };
