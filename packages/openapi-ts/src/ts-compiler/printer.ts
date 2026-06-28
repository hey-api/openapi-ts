import type { TsNode } from './nodes/base';
import type { EmitHint } from './nodes/emit-hint';
import { TsNodeKind } from './nodes/kinds';
import { TsNodeFlags } from './nodes/node-flags';
import { SyntaxKind } from './nodes/syntax-kind';

export interface TsPrinterOptions {
  /**
   * Number of spaces per indentation level.
   *
   * @default 2
   */
  indentSize?: number;
  /**
   * Whether to add trailing semicolons to statements.
   *
   * @default true
   */
  semicolons?: boolean;
}

interface PrintContext {
  inline?: boolean;
  skipComments?: boolean;
}

const TOKEN_TEXT: Record<SyntaxKind, string> = {
  [SyntaxKind.AmpersandAmpersandToken]: '&&',
  [SyntaxKind.AmpersandToken]: '&',
  [SyntaxKind.AsteriskAsteriskToken]: '**',
  [SyntaxKind.AsteriskToken]: '*',
  [SyntaxKind.BarBarToken]: '||',
  [SyntaxKind.BarToken]: '|',
  [SyntaxKind.CaretToken]: '^',
  [SyntaxKind.ColonToken]: ':',
  [SyntaxKind.DotDotDotToken]: '...',
  [SyntaxKind.EqualsEqualsEqualsToken]: '===',
  [SyntaxKind.EqualsEqualsToken]: '==',
  [SyntaxKind.EqualsGreaterThanToken]: '=>',
  [SyntaxKind.EqualsToken]: '=',
  [SyntaxKind.ExclamationEqualsEqualsToken]: '!==',
  [SyntaxKind.ExclamationEqualsToken]: '!=',
  [SyntaxKind.ExclamationToken]: '!',
  [SyntaxKind.GreaterThanEqualsToken]: '>=',
  [SyntaxKind.GreaterThanToken]: '>',
  [SyntaxKind.LessThanEqualsToken]: '<=',
  [SyntaxKind.LessThanToken]: '<',
  [SyntaxKind.MinusMinusToken]: '--',
  [SyntaxKind.MinusToken]: '-',
  [SyntaxKind.PercentToken]: '%',
  [SyntaxKind.PlusPlusToken]: '++',
  [SyntaxKind.PlusToken]: '+',
  [SyntaxKind.QuestionDotToken]: '?.',
  [SyntaxKind.QuestionQuestionEqualsToken]: '??=',
  [SyntaxKind.QuestionQuestionToken]: '??',
  [SyntaxKind.QuestionToken]: '?',
  [SyntaxKind.SlashToken]: '/',
  [SyntaxKind.TildeToken]: '~',
  [SyntaxKind.AbstractKeyword]: 'abstract',
  [SyntaxKind.AccessorKeyword]: 'accessor',
  [SyntaxKind.AsyncKeyword]: 'async',
  [SyntaxKind.AwaitKeyword]: 'await',
  [SyntaxKind.ConstKeyword]: 'const',
  [SyntaxKind.DeclareKeyword]: 'declare',
  [SyntaxKind.DefaultKeyword]: 'default',
  [SyntaxKind.ExportKeyword]: 'export',
  [SyntaxKind.InKeyword]: 'in',
  [SyntaxKind.OutKeyword]: 'out',
  [SyntaxKind.OverrideKeyword]: 'override',
  [SyntaxKind.PrivateKeyword]: 'private',
  [SyntaxKind.ProtectedKeyword]: 'protected',
  [SyntaxKind.PublicKeyword]: 'public',
  [SyntaxKind.ReadonlyKeyword]: 'readonly',
  [SyntaxKind.StaticKeyword]: 'static',
  [SyntaxKind.ExtendsKeyword]: 'extends',
  [SyntaxKind.ImplementsKeyword]: 'implements',
  [SyntaxKind.KeyOfKeyword]: 'keyof',
  [SyntaxKind.UniqueKeyword]: 'unique',
  [SyntaxKind.AnyKeyword]: 'any',
  [SyntaxKind.BigIntKeyword]: 'bigint',
  [SyntaxKind.BooleanKeyword]: 'boolean',
  [SyntaxKind.FalseKeyword]: 'false',
  [SyntaxKind.NeverKeyword]: 'never',
  [SyntaxKind.NullKeyword]: 'null',
  [SyntaxKind.NumberKeyword]: 'number',
  [SyntaxKind.ObjectKeyword]: 'object',
  [SyntaxKind.StringKeyword]: 'string',
  [SyntaxKind.SymbolKeyword]: 'symbol',
  [SyntaxKind.TrueKeyword]: 'true',
  [SyntaxKind.TypeKeyword]: 'type',
  [SyntaxKind.UndefinedKeyword]: 'undefined',
  [SyntaxKind.UnknownKeyword]: 'unknown',
  [SyntaxKind.VoidKeyword]: 'void',
  [SyntaxKind.MultiLineCommentTrivia]: '',
  [SyntaxKind.SingleLineCommentTrivia]: '',
};

function formatStringLiteral(text: string): string {
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replaceAll("'", "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `'${escaped}'`;
}

function formatTemplateText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

export function createPrinter(options?: TsPrinterOptions) {
  const indentUnit = ' '.repeat(options?.indentSize ?? 2);
  const semicolon = (options?.semicolons ?? true) ? ';' : '';
  let indentLevel = 0;

  function printComments(
    parts: Array<string>,
    lines: ReadonlyArray<string>,
    indent?: boolean,
  ): void {
    if (indent) indentLevel += 1;
    for (const comment of lines) {
      // JSDoc/block trivia carries its own framing across lines; '//' is for single-line trivia.
      if (comment.includes('\n') || comment.startsWith('*')) {
        const block = `/*${comment}*/`;
        parts.push(...block.split('\n').map((line) => printLine(line)));
      } else {
        parts.push(printLine(`//${comment}`));
      }
    }
    if (indent) indentLevel -= 1;
  }

  function printLine(line: string): string {
    return indentUnit.repeat(indentLevel) + line;
  }

  function printInline(node: TsNode, context: PrintContext = {}): string {
    return printNode(node, { ...context, inline: true });
  }

  function printModifiers(modifiers: ReadonlyArray<TsNode> | undefined): string {
    if (!modifiers || modifiers.length === 0) return '';
    return `${modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
  }

  function printName(name: string | TsNode): string {
    return typeof name === 'string' ? name : printInline(name);
  }

  function printTypeParameters(typeParameters: ReadonlyArray<TsNode> | undefined): string {
    if (!typeParameters || typeParameters.length === 0) return '';
    return `<${typeParameters.map((typeParameter) => printInline(typeParameter)).join(', ')}>`;
  }

  function printAccessTarget(expression: TsNode): string {
    const text = printInline(expression);
    return expression.kind === TsNodeKind.BinaryExpression ||
      expression.kind === TsNodeKind.ConditionalExpression ||
      expression.kind === TsNodeKind.ArrowFunction ||
      expression.kind === TsNodeKind.AwaitExpression ||
      expression.kind === TsNodeKind.FunctionExpression ||
      expression.kind === TsNodeKind.AsExpression ||
      expression.kind === TsNodeKind.SatisfiesExpression ||
      expression.kind === TsNodeKind.TypeOfExpression ||
      expression.kind === TsNodeKind.VoidExpression ||
      expression.kind === TsNodeKind.DeleteExpression
      ? `(${text})`
      : text;
  }

  function printIntersectionMember(type: TsNode): string {
    const text = printInline(type);
    return type.kind === TsNodeKind.UnionType ||
      type.kind === TsNodeKind.FunctionType ||
      type.kind === TsNodeKind.ConditionalType
      ? `(${text})`
      : text;
  }

  function printUnionMember(type: TsNode): string {
    const text = printInline(type);
    return type.kind === TsNodeKind.IntersectionType ||
      type.kind === TsNodeKind.FunctionType ||
      type.kind === TsNodeKind.ConditionalType
      ? `(${text})`
      : text;
  }

  function printNode(node: TsNode, context: PrintContext = {}): string {
    const parts: Array<string> = [];

    if (node.leadingComments && !context.skipComments) {
      printComments(parts, node.leadingComments);
    }

    switch (node.kind) {
      case TsNodeKind.ArrayBindingPattern: {
        const elements = node.elements.map((element) => printInline(element)).join(', ');
        parts.push(`[${elements}]`);
        break;
      }

      case TsNodeKind.ArrayLiteralExpression: {
        if (node.multiLine && node.elements.length > 0) {
          const lines: Array<string> = ['['];
          indentLevel += 1;
          node.elements.forEach((element, index) => {
            const text = printLine(printInline(element));
            lines.push(index < node.elements.length - 1 ? `${text},` : text);
          });
          indentLevel -= 1;
          lines.push(printLine(']'));
          parts.push(lines.join('\n'));
          break;
        }
        indentLevel += 1;
        const arrayElements = node.elements.map((element) => printInline(element));
        indentLevel -= 1;
        // tsc keeps an inline array's leading `{`/`[` on the bracket line, indenting
        // the broken element one extra level (`[{` ... `}]`).
        parts.push(`[${arrayElements.join(', ')}]`);
        break;
      }

      case TsNodeKind.ArrayType:
        parts.push(`${printInline(node.elementType)}[]`);
        break;

      case TsNodeKind.ArrowFunction: {
        let text = printModifiers(node.modifiers);
        text += printTypeParameters(node.typeParameters);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        const onlyParameter = node.parameters.length === 1 ? node.parameters[0] : undefined;
        const bareParameter =
          !node.type &&
          !node.modifiers?.length &&
          !node.typeParameters?.length &&
          onlyParameter !== undefined &&
          !onlyParameter.type &&
          !onlyParameter.questionToken &&
          !onlyParameter.dotDotDotToken &&
          !onlyParameter.initializer &&
          !onlyParameter.modifiers?.length &&
          (typeof onlyParameter.name === 'string' ||
            onlyParameter.name.kind === TsNodeKind.Identifier);
        text += bareParameter ? parameters : `(${parameters})`;
        if (node.type) text += `: ${printInline(node.type)}`;
        const body =
          node.body.kind === TsNodeKind.ObjectLiteralExpression
            ? `(${printInline(node.body)})`
            : printInline(node.body);
        text += ` ${printInline(node.equalsGreaterThanToken)} ${body}`;
        parts.push(text);
        break;
      }

      case TsNodeKind.AsExpression: {
        parts.push(`${printInline(node.expression)} as ${printInline(node.type)}`);
        break;
      }

      case TsNodeKind.AwaitExpression: {
        parts.push(`await ${printInline(node.expression)}`);
        break;
      }

      case TsNodeKind.BigIntLiteral: {
        parts.push(node.text);
        break;
      }

      case TsNodeKind.BinaryExpression: {
        parts.push(
          `${printInline(node.left)} ${printInline(node.operatorToken)} ${printInline(node.right)}`,
        );
        break;
      }

      case TsNodeKind.BindingElement: {
        let text = '';
        if (node.dotDotDotToken) text += printInline(node.dotDotDotToken);
        if (node.propertyName !== undefined) text += `${printInline(node.propertyName)}: `;
        text += typeof node.name === 'string' ? node.name : printInline(node.name);
        if (node.initializer) text += ` = ${printInline(node.initializer)}`;
        parts.push(text);
        break;
      }

      case TsNodeKind.Block: {
        if (node.statements.length === 0) {
          parts.push('{}');
          break;
        }
        const lines: Array<string> = ['{'];
        indentLevel += 1;
        for (const statement of node.statements) {
          lines.push(printNode(statement));
        }
        indentLevel -= 1;
        lines.push(printLine('}'));
        parts.push(lines.join('\n'));
        break;
      }

      case TsNodeKind.CallExpression: {
        let text = printAccessTarget(node.expression);
        if (node.typeArguments && node.typeArguments.length > 0)
          text += `<${node.typeArguments.map((typeArgument) => printInline(typeArgument)).join(', ')}>`;
        if (node.arguments.some((argument) => argument.leadingComments?.length)) {
          const renderedArguments = node.arguments.map((argument) => {
            const argumentParts: Array<string> = [];
            if (argument.leadingComments) printComments(argumentParts, argument.leadingComments);
            argumentParts.push(printLine(printNode(argument, { skipComments: true })));
            return argumentParts.join('\n');
          });
          text += `(\n${renderedArguments.join(',\n')})`;
        } else {
          text += `(${node.arguments.map((argument) => printInline(argument)).join(', ')})`;
        }
        parts.push(text);
        break;
      }

      case TsNodeKind.CatchClause: {
        const binding = node.variableDeclaration
          ? ` (${printInline(node.variableDeclaration)})`
          : '';
        parts.push(`catch${binding} ${printInline(node.block)}`);
        break;
      }

      case TsNodeKind.ClassDeclaration: {
        const decorators =
          node.modifiers?.filter((modifier) => modifier.kind === TsNodeKind.Decorator) ?? [];
        const keywordModifiers = node.modifiers?.filter(
          (modifier) => modifier.kind !== TsNodeKind.Decorator,
        );
        decorators.forEach((decorator) => parts.push(printLine(printInline(decorator))));
        const modifiers = printModifiers(keywordModifiers);
        let heading = `${modifiers}class`;
        if (node.name) heading += ` ${printName(node.name)}`;
        heading += printTypeParameters(node.typeParameters);
        if (node.heritageClauses) {
          heading += node.heritageClauses.map((clause) => ` ${printInline(clause)}`).join('');
        }
        if (node.members.length === 0) {
          parts.push(printLine(`${heading} {}`));
          break;
        }
        parts.push(printLine(`${heading} {`));
        indentLevel += 1;
        node.members.forEach((member) => {
          // The DSL marks an explicit blank line between members with a lone-newline identifier.
          const marker = member as TsNode;
          if (marker.kind === TsNodeKind.Identifier && marker.text === '\n') {
            parts.push(printLine(''));
            return;
          }
          parts.push(printNode(member));
        });
        indentLevel -= 1;
        parts.push(printLine('}'));
        break;
      }

      case TsNodeKind.ComputedPropertyName:
        parts.push(`[${printInline(node.expression)}]`);
        break;

      case TsNodeKind.ConditionalExpression: {
        parts.push(
          `${printInline(node.condition)} ${printInline(node.questionToken)} ${printInline(node.whenTrue)} ${printInline(node.colonToken)} ${printInline(node.whenFalse)}`,
        );
        break;
      }

      case TsNodeKind.ConditionalType: {
        parts.push(
          `${printInline(node.checkType)} extends ${printInline(node.extendsType)} ? ${printInline(node.trueType)} : ${printInline(node.falseType)}`,
        );
        break;
      }

      case TsNodeKind.Constructor: {
        const modifiers = printModifiers(node.modifiers);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        const signature = `${modifiers}constructor(${parameters})`;
        parts.push(
          printLine(
            node.body ? `${signature} ${printInline(node.body)}` : `${signature}${semicolon}`,
          ),
        );
        break;
      }

      case TsNodeKind.Decorator:
        parts.push(`@${printInline(node.expression)}`);
        break;

      case TsNodeKind.DeleteExpression: {
        parts.push(`delete ${printInline(node.expression)}`);
        break;
      }

      case TsNodeKind.ElementAccessExpression:
        parts.push(
          `${printAccessTarget(node.expression)}${node.questionDotToken ? '?.' : ''}[${printInline(node.argumentExpression)}]`,
        );
        break;

      case TsNodeKind.EnumDeclaration: {
        let header = '';
        if (node.modifiers?.length) {
          header += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        header += `enum ${printName(node.name)}`;
        if (node.members.length === 0) {
          parts.push(printLine(`${header} {}`));
          break;
        }
        parts.push(printLine(`${header} {`));
        indentLevel += 1;
        node.members.forEach((member, index) => {
          const text = printNode(member);
          parts.push(index < node.members.length - 1 ? `${text},` : text);
        });
        indentLevel -= 1;
        parts.push(printLine('}'));
        break;
      }

      case TsNodeKind.EnumMember: {
        let text = printName(node.name);
        if (node.initializer) text += ` = ${printInline(node.initializer)}`;
        parts.push(printLine(text));
        break;
      }

      case TsNodeKind.ExportDeclaration: {
        let text = 'export ';
        if (node.typeOnlyToken) text += `${printInline(node.typeOnlyToken)} `;
        text += node.exportClause ? printInline(node.exportClause) : '*';
        if (node.moduleSpecifier) text += ` from ${printInline(node.moduleSpecifier)}`;
        parts.push(printLine(`${text}${semicolon}`));
        break;
      }

      case TsNodeKind.ExportSpecifier: {
        let text = '';
        if (node.typeOnlyToken) text += `${printInline(node.typeOnlyToken)} `;
        if (node.propertyName) text += `${printInline(node.propertyName)} as `;
        text += printInline(node.name);
        parts.push(text);
        break;
      }

      case TsNodeKind.ExpressionStatement:
        parts.push(printLine(`${printInline(node.expression)}${semicolon}`));
        break;

      case TsNodeKind.ExpressionWithTypeArguments: {
        let text = printInline(node.expression);
        if (node.typeArguments && node.typeArguments.length > 0)
          text += `<${node.typeArguments.map((typeArgument) => printInline(typeArgument)).join(', ')}>`;
        parts.push(text);
        break;
      }

      case TsNodeKind.ForInStatement:
        parts.push(
          printLine(
            `for (${printInline(node.initializer)} in ${printInline(node.expression)}) ${printInline(node.statement)}`,
          ),
        );
        break;

      case TsNodeKind.ForOfStatement: {
        const awaitModifier = node.awaitModifier ? `${printInline(node.awaitModifier)} ` : '';
        parts.push(
          printLine(
            `for ${awaitModifier}(${printInline(node.initializer)} of ${printInline(node.expression)}) ${printInline(node.statement)}`,
          ),
        );
        break;
      }

      case TsNodeKind.ForStatement: {
        const initializer = node.initializer ? printInline(node.initializer) : '';
        const condition = node.condition ? printInline(node.condition) : '';
        const incrementor = node.incrementor ? printInline(node.incrementor) : '';
        parts.push(
          printLine(
            `for (${initializer}; ${condition}; ${incrementor}) ${printInline(node.statement)}`,
          ),
        );
        break;
      }

      case TsNodeKind.FunctionDeclaration: {
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        let signature = `${printModifiers(node.modifiers)}function`;
        if (node.asteriskToken) signature += printInline(node.asteriskToken);
        if (node.name) signature += ` ${printInline(node.name)}`;
        signature += printTypeParameters(node.typeParameters);
        signature += `(${parameters})`;
        if (node.type) signature += `: ${printInline(node.type)}`;
        parts.push(
          node.body
            ? `${printLine(signature)} ${printInline(node.body)}`
            : printLine(`${signature}${semicolon}`),
        );
        break;
      }

      case TsNodeKind.FunctionExpression: {
        let text = '';
        if (node.modifiers?.length) {
          text += node.modifiers.map((modifier) => `${printInline(modifier)} `).join('');
        }
        text += 'function';
        if (node.asteriskToken) text += printInline(node.asteriskToken);
        if (node.name) text += ` ${printInline(node.name)}`;
        text += printTypeParameters(node.typeParameters);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        text += `${node.name ? '' : ' '}(${parameters})`;
        if (node.type) text += `: ${printInline(node.type)}`;
        text += ` ${printInline(node.body)}`;
        parts.push(text);
        break;
      }

      case TsNodeKind.FunctionType: {
        const typeParameters =
          node.typeParameters && node.typeParameters.length > 0
            ? `<${node.typeParameters.map((typeParameter) => printInline(typeParameter)).join(', ')}>`
            : '';
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        parts.push(`${typeParameters}(${parameters}) => ${printInline(node.type)}`);
        break;
      }

      case TsNodeKind.GetAccessor: {
        const modifiers = printModifiers(node.modifiers);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        let signature = `${modifiers}get ${printName(node.name)}(${parameters})`;
        if (node.type) signature += `: ${printInline(node.type)}`;
        parts.push(
          printLine(
            node.body ? `${signature} ${printInline(node.body)}` : `${signature}${semicolon}`,
          ),
        );
        break;
      }

      case TsNodeKind.HeritageClause: {
        const types = node.types.map((type) => printInline(type)).join(', ');
        parts.push(`${TOKEN_TEXT[node.token.syntaxKind]} ${types}`);
        break;
      }

      case TsNodeKind.Identifier:
        parts.push(node.text);
        break;

      case TsNodeKind.IfStatement: {
        let text = `if (${printInline(node.expression)}) ${printInline(node.thenStatement)}`;
        if (node.elseStatement) {
          text += ` else ${printInline(node.elseStatement)}`;
        }
        parts.push(printLine(text));
        break;
      }

      case TsNodeKind.ImportClause: {
        const segments: Array<string> = [];
        if (node.phaseModifier) segments.push(printInline(node.phaseModifier));
        const names: Array<string> = [];
        if (node.name) names.push(printInline(node.name));
        if (node.namedBindings) names.push(printInline(node.namedBindings));
        segments.push(names.join(', '));
        parts.push(segments.join(' '));
        break;
      }

      case TsNodeKind.ImportDeclaration: {
        let text = 'import ';
        if (node.importClause) text += `${printInline(node.importClause)} from `;
        text += printInline(node.moduleSpecifier);
        parts.push(printLine(`${text}${semicolon}`));
        break;
      }

      case TsNodeKind.ImportSpecifier: {
        let text = '';
        if (node.typeOnlyToken) text += `${printInline(node.typeOnlyToken)} `;
        if (node.propertyName) text += `${printInline(node.propertyName)} as `;
        text += printInline(node.name);
        parts.push(text);
        break;
      }

      case TsNodeKind.IndexSignature: {
        let text = '';
        if (node.modifiers?.length) {
          text += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        const parameters = node.parameters
          .map((parameter) => {
            let entry = printName(parameter.name);
            if (parameter.type) entry += `: ${printInline(parameter.type)}`;
            return entry;
          })
          .join(', ');
        text += `[${parameters}]: ${printInline(node.type)}`;
        parts.push(printLine(`${text}${semicolon}`));
        break;
      }

      case TsNodeKind.IndexedAccessType:
        parts.push(`${printInline(node.objectType)}[${printInline(node.indexType)}]`);
        break;

      case TsNodeKind.InterfaceDeclaration: {
        let header = '';
        if (node.modifiers?.length) {
          header += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        header += `interface ${node.name}`;
        if (node.typeParameters?.length) {
          header += `<${node.typeParameters
            .map((typeParameter) => {
              let text = typeParameter.name;
              if (typeParameter.constraint)
                text += ` extends ${printInline(typeParameter.constraint)}`;
              if (typeParameter.default) text += ` = ${printInline(typeParameter.default)}`;
              return text;
            })
            .join(', ')}>`;
        }
        if (node.heritageClauses?.length) {
          header += node.heritageClauses
            .map(
              (heritageClause) =>
                ` ${TOKEN_TEXT[heritageClause.token.syntaxKind]} ${heritageClause.types
                  .map((type) => printInline(type))
                  .join(', ')}`,
            )
            .join('');
        }
        if (node.members.length === 0) {
          parts.push(printLine(`${header} {}`));
          break;
        }
        parts.push(printLine(`${header} {`));
        indentLevel += 1;
        node.members.forEach((member) => parts.push(printNode(member)));
        indentLevel -= 1;
        parts.push(printLine('}'));
        break;
      }

      case TsNodeKind.IntersectionType:
        parts.push(node.types.map((type) => printIntersectionMember(type)).join(' & '));
        break;

      case TsNodeKind.JSDoc: {
        const comment =
          typeof node.comment === 'string'
            ? node.comment
            : (node.comment?.map((part) => printInline(part)).join('') ?? '');
        const tags = node.tags?.map((tag) => printInline(tag)) ?? [];
        const lines = [...(comment ? comment.split('\n') : []), ...tags.map((tag) => `@${tag}`)];
        if (lines.length === 0) {
          parts.push(printLine('/** */'));
          break;
        }
        if (lines.length === 1) {
          parts.push(printLine(`/** ${lines[0]} */`));
          break;
        }
        parts.push(printLine('/**'));
        lines.forEach((line) => parts.push(printLine(` * ${line}`)));
        parts.push(printLine(' */'));
        break;
      }

      case TsNodeKind.JSDocText:
        parts.push(node.text);
        break;

      case TsNodeKind.KeywordType:
        parts.push(TOKEN_TEXT[node.syntaxKind]);
        break;

      case TsNodeKind.LiteralType:
        parts.push(printInline(node.literal));
        break;

      case TsNodeKind.MappedType: {
        indentLevel += 1;
        let member = '';
        if (node.readonlyToken) {
          member +=
            node.readonlyToken.syntaxKind === SyntaxKind.ReadonlyKeyword
              ? 'readonly '
              : `${printInline(node.readonlyToken)}readonly `;
        }
        member += `[${printName(node.typeParameter.name)}`;
        if (node.typeParameter.constraint)
          member += ` in ${printInline(node.typeParameter.constraint)}`;
        if (node.nameType) member += ` as ${printInline(node.nameType)}`;
        member += ']';
        if (node.questionToken) {
          member +=
            node.questionToken.syntaxKind === SyntaxKind.QuestionToken
              ? '?'
              : `${printInline(node.questionToken)}?`;
        }
        if (node.type) member += `: ${printInline(node.type)}`;
        const memberLine = printLine(`${member}${semicolon}`);
        indentLevel -= 1;
        parts.push(['{', memberLine, printLine('}')].join('\n'));
        break;
      }

      case TsNodeKind.MethodDeclaration: {
        const modifiers = printModifiers(node.modifiers);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        let signature = modifiers;
        if (node.asteriskToken) signature += printInline(node.asteriskToken);
        signature += printName(node.name);
        if (node.questionToken) signature += printInline(node.questionToken);
        signature += printTypeParameters(node.typeParameters);
        signature += `(${parameters})`;
        if (node.type) signature += `: ${printInline(node.type)}`;
        parts.push(
          printLine(
            node.body ? `${signature} ${printInline(node.body)}` : `${signature}${semicolon}`,
          ),
        );
        break;
      }

      case TsNodeKind.NamedExports: {
        const elements = node.elements.map((element) => printInline(element));
        parts.push(elements.length === 0 ? '{}' : `{ ${elements.join(', ')} }`);
        break;
      }

      case TsNodeKind.NamedImports: {
        const elements = node.elements.map((element) => printInline(element));
        parts.push(elements.length === 0 ? '{}' : `{ ${elements.join(', ')} }`);
        break;
      }

      case TsNodeKind.NamedTupleMember: {
        let text = '';
        if (node.dotDotDotToken) text += printInline(node.dotDotDotToken);
        text += printName(node.name);
        if (node.questionToken) text += printInline(node.questionToken);
        text += `: ${printInline(node.type)}`;
        parts.push(text);
        break;
      }

      case TsNodeKind.NamespaceExport:
        parts.push(`* as ${printInline(node.name)}`);
        break;

      case TsNodeKind.NamespaceImport:
        parts.push(`* as ${printInline(node.name)}`);
        break;

      case TsNodeKind.NewExpression: {
        let text = `new ${printAccessTarget(node.expression)}`;
        if (node.typeArguments && node.typeArguments.length > 0)
          text += `<${node.typeArguments.map((typeArgument) => printInline(typeArgument)).join(', ')}>`;
        text += `(${(node.arguments ?? []).map((argument) => printInline(argument)).join(', ')})`;
        parts.push(text);
        break;
      }

      case TsNodeKind.NoSubstitutionTemplateLiteral: {
        parts.push(`\`${formatTemplateText(node.text)}\``);
        break;
      }

      case TsNodeKind.NonNullExpression:
        parts.push(`${printAccessTarget(node.expression)}!`);
        break;

      case TsNodeKind.NumericLiteral:
        parts.push(node.text);
        break;

      case TsNodeKind.ObjectBindingPattern: {
        const elements = node.elements.map((element) => printInline(element)).join(', ');
        parts.push(`{ ${elements} }`);
        break;
      }

      case TsNodeKind.ObjectLiteralExpression: {
        if (node.properties.length === 0) {
          parts.push('{}');
          break;
        }
        if (node.multiLine) {
          const lines: Array<string> = ['{'];
          indentLevel += 1;
          node.properties.forEach((property, index) => {
            const text = printLine(printInline(property));
            lines.push(index < node.properties.length - 1 ? `${text},` : text);
          });
          indentLevel -= 1;
          lines.push(printLine('}'));
          parts.push(lines.join('\n'));
          break;
        }
        indentLevel += 1;
        const properties = node.properties.map((property) => printInline(property)).join(', ');
        indentLevel -= 1;
        parts.push(`{ ${properties} }`);
        break;
      }

      case TsNodeKind.Parameter: {
        let text = '';
        if (node.modifiers?.length) {
          text += node.modifiers.map((modifier) => `${printInline(modifier)} `).join('');
        }
        if (node.dotDotDotToken) text += printInline(node.dotDotDotToken);
        text += typeof node.name === 'string' ? node.name : printInline(node.name);
        if (node.questionToken) text += printInline(node.questionToken);
        if (node.type) text += `: ${printInline(node.type)}`;
        if (node.initializer) text += ` = ${printInline(node.initializer)}`;
        parts.push(text);
        break;
      }

      case TsNodeKind.ParenthesizedExpression:
        parts.push(`(${printInline(node.expression)})`);
        break;

      case TsNodeKind.PostfixUnaryExpression: {
        parts.push(`${printInline(node.operand)}${TOKEN_TEXT[node.operator]}`);
        break;
      }

      case TsNodeKind.PrefixUnaryExpression: {
        parts.push(`${TOKEN_TEXT[node.operator]}${printInline(node.operand)}`);
        break;
      }

      case TsNodeKind.PrivateIdentifier: {
        parts.push(node.text);
        break;
      }

      case TsNodeKind.PropertyAccessExpression:
        parts.push(
          `${printAccessTarget(node.expression)}${node.questionDotToken ? '?.' : '.'}${printInline(node.name)}`,
        );
        break;

      case TsNodeKind.PropertyAssignment:
        parts.push(`${printInline(node.name)}: ${printInline(node.initializer)}`);
        break;

      case TsNodeKind.PropertyDeclaration: {
        const modifiers = printModifiers(node.modifiers);
        let text = `${modifiers}${printName(node.name)}`;
        if (node.questionToken) text += printInline(node.questionToken);
        if (node.exclamationToken) text += printInline(node.exclamationToken);
        if (node.type) text += `: ${printInline(node.type)}`;
        if (node.initializer) text += ` = ${printInline(node.initializer)}`;
        parts.push(printLine(`${text}${semicolon}`));
        break;
      }

      case TsNodeKind.PropertySignature: {
        let text = '';
        if (node.modifiers?.length) {
          text += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        text += printName(node.name);
        if (node.questionToken) text += printInline(node.questionToken);
        if (node.type) text += `: ${printInline(node.type)}`;
        parts.push(printLine(`${text}${semicolon}`));
        break;
      }

      case TsNodeKind.QualifiedName:
        parts.push(`${printInline(node.left)}.${printInline(node.right)}`);
        break;

      case TsNodeKind.RegularExpressionLiteral: {
        parts.push(node.text);
        break;
      }

      case TsNodeKind.ReturnStatement:
        parts.push(
          printLine(
            node.expression
              ? `return ${printInline(node.expression)}${semicolon}`
              : `return${semicolon}`,
          ),
        );
        break;

      case TsNodeKind.SatisfiesExpression: {
        parts.push(`${printInline(node.expression)} satisfies ${printInline(node.type)}`);
        break;
      }

      case TsNodeKind.SetAccessor: {
        const modifiers = printModifiers(node.modifiers);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        const signature = `${modifiers}set ${printName(node.name)}(${parameters})`;
        parts.push(
          printLine(
            node.body ? `${signature} ${printInline(node.body)}` : `${signature}${semicolon}`,
          ),
        );
        break;
      }

      case TsNodeKind.ShorthandPropertyAssignment: {
        let text = printInline(node.name);
        if (node.objectAssignmentInitializer) {
          text += ` = ${printInline(node.objectAssignmentInitializer)}`;
        }
        parts.push(text);
        break;
      }

      case TsNodeKind.SourceFile:
        node.statements.forEach((statement, index) => {
          if (index > 0) parts.push('');
          parts.push(printNode(statement));
        });
        break;

      case TsNodeKind.SpreadAssignment:
        parts.push(`...${printInline(node.expression)}`);
        break;

      case TsNodeKind.SpreadElement: {
        parts.push(`...${printInline(node.expression)}`);
        break;
      }

      case TsNodeKind.StringLiteral:
        parts.push(formatStringLiteral(node.text));
        break;

      case TsNodeKind.TaggedTemplateExpression: {
        let text = printInline(node.tag);
        if (node.typeArguments && node.typeArguments.length > 0)
          text += `<${node.typeArguments.map((typeArgument) => printInline(typeArgument)).join(', ')}>`;
        text += printInline(node.template);
        parts.push(text);
        break;
      }

      case TsNodeKind.TemplateExpression: {
        const spans = node.templateSpans.map((span) => printInline(span)).join('');
        parts.push(`${printInline(node.head)}${spans}`);
        break;
      }

      case TsNodeKind.TemplateHead:
        parts.push(`\`${formatTemplateText(node.text)}${'${'}`);
        break;

      case TsNodeKind.TemplateLiteralType: {
        let text = `\`${node.head.text}`;
        for (const span of node.templateSpans) text += printInline(span);
        parts.push(`${text}\``);
        break;
      }

      case TsNodeKind.TemplateLiteralTypeSpan:
        parts.push(`\${${printInline(node.type)}}${node.literal.text}`);
        break;

      case TsNodeKind.TemplateMiddle:
        parts.push(`}${formatTemplateText(node.text)}${'${'}`);
        break;

      case TsNodeKind.TemplateSpan:
        parts.push(`${printInline(node.expression)}${printInline(node.literal)}`);
        break;

      case TsNodeKind.TemplateTail:
        parts.push(`}${formatTemplateText(node.text)}\``);
        break;

      case TsNodeKind.ThrowStatement:
        parts.push(printLine(`throw ${printInline(node.expression)}${semicolon}`));
        break;

      case TsNodeKind.Token:
        parts.push(TOKEN_TEXT[node.syntaxKind]);
        break;

      case TsNodeKind.TryStatement: {
        let text = `try ${printInline(node.tryBlock)}`;
        if (node.catchClause) text += ` ${printInline(node.catchClause)}`;
        if (node.finallyBlock) text += ` finally ${printInline(node.finallyBlock)}`;
        parts.push(printLine(text));
        break;
      }

      case TsNodeKind.TupleType: {
        if (node.elements.length === 0) {
          parts.push('[]');
          break;
        }
        const lines: Array<string> = ['['];
        indentLevel += 1;
        node.elements.forEach((element, index) => {
          const text = printLine(printInline(element));
          lines.push(index < node.elements.length - 1 ? `${text},` : text);
        });
        indentLevel -= 1;
        lines.push(printLine(']'));
        parts.push(lines.join('\n'));
        break;
      }

      case TsNodeKind.TypeAliasDeclaration: {
        let header = '';
        if (node.modifiers?.length) {
          header += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        header += `type ${printName(node.name)}`;
        if (node.typeParameters?.length) {
          header += `<${node.typeParameters
            .map((typeParameter) => {
              let text = printName(typeParameter.name);
              if (typeParameter.constraint)
                text += ` extends ${printInline(typeParameter.constraint)}`;
              if (typeParameter.default) text += ` = ${printInline(typeParameter.default)}`;
              return text;
            })
            .join(', ')}>`;
        }
        parts.push(printLine(`${header} = ${printInline(node.type)}${semicolon}`));
        break;
      }

      case TsNodeKind.TypeLiteral: {
        if (node.members.length === 0) {
          parts.push('{}');
          break;
        }
        const lines: Array<string> = ['{'];
        indentLevel += 1;
        for (const member of node.members) {
          lines.push(printNode(member));
        }
        indentLevel -= 1;
        lines.push(printLine('}'));
        parts.push(lines.join('\n'));
        break;
      }

      case TsNodeKind.TypeOfExpression: {
        parts.push(`typeof ${printInline(node.expression)}`);
        break;
      }

      case TsNodeKind.TypeOperator:
        parts.push(`${TOKEN_TEXT[node.operator]} ${printInline(node.type)}`);
        break;

      case TsNodeKind.TypeParameter: {
        const modifiers =
          node.modifiers?.map((modifier) => `${TOKEN_TEXT[modifier.syntaxKind]} `).join('') ?? '';
        let text = `${modifiers}${printName(node.name)}`;
        if (node.constraint) text += ` extends ${printInline(node.constraint)}`;
        if (node.default) text += ` = ${printInline(node.default)}`;
        parts.push(text);
        break;
      }

      case TsNodeKind.TypeQuery: {
        let text = `typeof ${typeof node.exprName === 'string' ? node.exprName : printInline(node.exprName)}`;
        if (node.typeArguments && node.typeArguments.length > 0) {
          text += `<${node.typeArguments.map((argument) => printInline(argument)).join(', ')}>`;
        }
        parts.push(text);
        break;
      }

      case TsNodeKind.TypeReference: {
        const name = typeof node.typeName === 'string' ? node.typeName : printInline(node.typeName);
        const typeArguments =
          node.typeArguments && node.typeArguments.length > 0
            ? `<${node.typeArguments.map((argument) => printInline(argument)).join(', ')}>`
            : '';
        parts.push(`${name}${typeArguments}`);
        break;
      }

      case TsNodeKind.UnionType:
        parts.push(node.types.map((type) => printUnionMember(type)).join(' | '));
        break;

      case TsNodeKind.VariableDeclaration: {
        let text = printName(node.name);
        if (node.exclamationToken) text += printInline(node.exclamationToken);
        if (node.type) text += `: ${printInline(node.type)}`;
        if (node.initializer) text += ` = ${printInline(node.initializer)}`;
        parts.push(text);
        break;
      }

      case TsNodeKind.VariableDeclarationList: {
        const keyword =
          node.flags === TsNodeFlags.Const
            ? 'const'
            : node.flags === TsNodeFlags.Let
              ? 'let'
              : 'var';
        const declarations = node.declarations
          .map((declaration) => printInline(declaration))
          .join(', ');
        parts.push(`${keyword} ${declarations}`);
        break;
      }

      case TsNodeKind.VariableStatement:
        parts.push(
          printLine(
            `${printModifiers(node.modifiers)}${printInline(node.declarationList)}${semicolon}`,
          ),
        );
        break;

      case TsNodeKind.VoidExpression: {
        parts.push(`void ${printInline(node.expression)}`);
        break;
      }

      default:
        // @ts-expect-error
        throw new Error(`Unsupported node kind: ${node.kind}`);
    }

    if (node.trailingComments) {
      if (!context.inline) {
        parts.push('');
      }
      printComments(parts, node.trailingComments, false);
    }

    return parts.join('\n');
  }

  function printFile(node: TsNode): string {
    const text = printNode(node);
    return text === '' ? '' : `${text}\n`;
  }

  return {
    printFile,
    printNode: (_emitHint: EmitHint, node: TsNode, _sourceFile?: TsNode): string => printNode(node),
  };
}

export function printAst(node: TsNode): string {
  return JSON.stringify(node, null, 2);
}
