import ts from 'typescript';

import type { MaybeTsDsl } from './base';
import { TsDsl } from './base';

type Operator =
  | '!='
  | '!=='
  | '&&'
  | '*'
  | '+'
  | '-'
  | '/'
  | '<'
  | '<='
  | '='
  | '=='
  | '==='
  | '>'
  | '>='
  | '??'
  | '||';

export class BinaryTsDsl extends TsDsl<ts.BinaryExpression> {
  private left: string | MaybeTsDsl<ts.Expression>;
  private operator: Operator | ts.BinaryOperator;
  private right: string | MaybeTsDsl<ts.Expression>;

  constructor(
    left: string | MaybeTsDsl<ts.Expression>,
    operator: Operator | ts.BinaryOperator,
    right: string | MaybeTsDsl<ts.Expression>,
  ) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  $render(): ts.BinaryExpression {
    const leftNode = this.$node(this.left);
    const rightNode = this.$node(this.right);
    const operatorToken =
      typeof this.operator === 'string'
        ? this.mapOperator(this.operator)
        : this.operator;
    return ts.factory.createBinaryExpression(
      leftNode,
      operatorToken,
      rightNode,
    );
  }

  private mapOperator(
    operator: Operator,
  ): ts.BinaryOperator | ts.BinaryOperatorToken {
    const tokenMap: Record<Operator, ts.BinaryOperator> = {
      '!=': ts.SyntaxKind.ExclamationEqualsToken,
      '!==': ts.SyntaxKind.ExclamationEqualsEqualsToken,
      '&&': ts.SyntaxKind.AmpersandAmpersandToken,
      '*': ts.SyntaxKind.AsteriskToken,
      '+': ts.SyntaxKind.PlusToken,
      '-': ts.SyntaxKind.MinusToken,
      '/': ts.SyntaxKind.SlashToken,
      '<': ts.SyntaxKind.LessThanToken,
      '<=': ts.SyntaxKind.LessThanEqualsToken,
      '=': ts.SyntaxKind.EqualsToken,
      '==': ts.SyntaxKind.EqualsEqualsToken,
      '===': ts.SyntaxKind.EqualsEqualsEqualsToken,
      '>': ts.SyntaxKind.GreaterThanToken,
      '>=': ts.SyntaxKind.GreaterThanEqualsToken,
      '??': ts.SyntaxKind.QuestionQuestionToken,
      '||': ts.SyntaxKind.BarBarToken,
    };
    const token = tokenMap[operator];
    if (!token) {
      throw new Error(`Unsupported operator: ${operator}`);
    }
    return token;
  }
}
