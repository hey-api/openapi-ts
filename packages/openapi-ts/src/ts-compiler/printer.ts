import type { TsNode } from './nodes/base';
import { TsNodeKind } from './nodes/kinds';
import { TsNodeFlags } from './nodes/node-flags';
import { SyntaxKind } from './nodes/syntax-kind';

export interface TsPrinterOptions {
  /**
   * Maximum line length before the printer wraps elements
   * such as parameters, fields, or list items.
   * Set to `0` to disable wrapping.
   *
   * @default 80
   */
  maxLineLength?: number;
}

interface PrintContext {
  inline?: boolean;
}

const INDENT = '  ';

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
  const single = (text.match(/'/g) ?? []).length;
  const double = (text.match(/"/g) ?? []).length;
  const quote = single > double ? '"' : "'";
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replaceAll(quote, `\\${quote}`)
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return `${quote}${escaped}${quote}`;
}

function formatTemplateText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPrinter(options?: TsPrinterOptions) {
  let indentLevel = 0;

  function printComments(
    parts: Array<string>,
    lines: ReadonlyArray<string>,
    indent?: boolean,
  ): void {
    if (indent) indentLevel += 1;
    parts.push(...lines.map((line) => printLine(`// ${line}`)));
    if (indent) indentLevel -= 1;
  }

  function printLine(line: string): string {
    return INDENT.repeat(indentLevel) + line;
  }

  function printInline(node: TsNode, context: PrintContext = {}): string {
    return printNode(node, { ...context, inline: true });
  }

  function printModifiers(modifiers: ReadonlyArray<TsNode> | undefined): string {
    if (!modifiers || modifiers.length === 0) return '';
    return `${modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
  }

  function printTypeParameters(typeParameters: ReadonlyArray<TsNode> | undefined): string {
    if (!typeParameters || typeParameters.length === 0) return '';
    return `<${typeParameters.map((typeParameter) => printInline(typeParameter)).join(', ')}>`;
  }

  function printNode(node: TsNode, context: PrintContext = {}): string {
    const parts: Array<string> = [];

    if (node.leadingComments) {
      printComments(parts, node.leadingComments);
    }

    switch (node.kind) {
      case TsNodeKind.ArrayBindingPattern: {
        const elements = node.elements.map((element) => printInline(element)).join(', ');
        parts.push(`[${elements}]`);
        break;
      }

      case TsNodeKind.ArrayLiteralExpression: {
        const elements = node.elements.map((element) => printInline(element)).join(', ');
        parts.push(`[${elements}]`);
        break;
      }

      case TsNodeKind.ArrayType:
        parts.push(`${printInline(node.elementType)}[]`);
        break;

      case TsNodeKind.ArrowFunction: {
        let text = printModifiers(node.modifiers);
        text += printTypeParameters(node.typeParameters);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        text += `(${parameters})`;
        if (node.type) text += `: ${printInline(node.type)}`;
        text += ` ${printInline(node.equalsGreaterThanToken)} ${printInline(node.body)}`;
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
        let text = printInline(node.expression);
        if (node.typeArguments)
          text += `<${node.typeArguments.map((typeArgument) => printInline(typeArgument)).join(', ')}>`;
        text += `(${node.arguments.map((argument) => printInline(argument)).join(', ')})`;
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
        const modifiers = printModifiers(node.modifiers);
        let heading = `${modifiers}class`;
        if (node.name) heading += ` ${node.name}`;
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
        node.members.forEach((member) => parts.push(printNode(member)));
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

      case TsNodeKind.Constructor: {
        const modifiers = printModifiers(node.modifiers);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        const signature = `${modifiers}constructor(${parameters})`;
        parts.push(
          printLine(node.body ? `${signature} ${printInline(node.body)}` : `${signature};`),
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
          `${printInline(node.expression)}${node.questionDotToken ? '?.' : ''}[${printInline(node.argumentExpression)}]`,
        );
        break;

      case TsNodeKind.EnumDeclaration: {
        let header = '';
        if (node.modifiers) {
          header += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        header += `enum ${node.name}`;
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

      case TsNodeKind.EnumMember: {
        let text = node.name;
        if (node.initializer) text += ` = ${printInline(node.initializer)}`;
        parts.push(printLine(`${text},`));
        break;
      }

      case TsNodeKind.ExportDeclaration: {
        let text = 'export ';
        if (node.typeOnlyToken) text += `${printInline(node.typeOnlyToken)} `;
        text += node.exportClause ? printInline(node.exportClause) : '*';
        if (node.moduleSpecifier) text += ` from ${printInline(node.moduleSpecifier)}`;
        parts.push(printLine(`${text};`));
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
        parts.push(printLine(`${printInline(node.expression)};`));
        break;

      case TsNodeKind.ExpressionWithTypeArguments: {
        let text = printInline(node.expression);
        if (node.typeArguments)
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
        parts.push(printLine(node.body ? `${signature} {}` : `${signature};`));
        break;
      }

      case TsNodeKind.FunctionExpression: {
        let text = '';
        if (node.modifiers) {
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
        let signature = `${modifiers}get ${node.name}(${parameters})`;
        if (node.type) signature += `: ${printInline(node.type)}`;
        parts.push(
          printLine(node.body ? `${signature} ${printInline(node.body)}` : `${signature};`),
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
        parts.push(printLine(`${text};`));
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
        if (node.modifiers) {
          text += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        const parameters = node.parameters
          .map((parameter) => {
            let entry = parameter.name;
            if (parameter.type) entry += `: ${printInline(parameter.type)}`;
            return entry;
          })
          .join(', ');
        text += `[${parameters}]: ${printInline(node.type)}`;
        parts.push(printLine(`${text};`));
        break;
      }

      case TsNodeKind.IndexedAccessType:
        parts.push(`${printInline(node.objectType)}[${printInline(node.indexType)}]`);
        break;

      case TsNodeKind.InterfaceDeclaration: {
        let header = '';
        if (node.modifiers) {
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
        parts.push(node.types.map((type) => printInline(type)).join(' & '));
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
        let text = '{ ';
        if (node.readonlyToken) {
          text +=
            node.readonlyToken.syntaxKind === SyntaxKind.ReadonlyKeyword
              ? 'readonly '
              : `${printInline(node.readonlyToken)}readonly `;
        }
        text += `[${node.typeParameter.name}`;
        if (node.typeParameter.constraint)
          text += ` in ${printInline(node.typeParameter.constraint)}`;
        if (node.nameType) text += ` as ${printInline(node.nameType)}`;
        text += ']';
        if (node.questionToken) {
          text +=
            node.questionToken.syntaxKind === SyntaxKind.QuestionToken
              ? '?'
              : `${printInline(node.questionToken)}?`;
        }
        if (node.type) text += `: ${printInline(node.type)}`;
        parts.push(`${text} }`);
        break;
      }

      case TsNodeKind.MethodDeclaration: {
        const modifiers = printModifiers(node.modifiers);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        let signature = modifiers;
        if (node.asteriskToken) signature += printInline(node.asteriskToken);
        signature += node.name;
        if (node.questionToken) signature += printInline(node.questionToken);
        signature += printTypeParameters(node.typeParameters);
        signature += `(${parameters})`;
        if (node.type) signature += `: ${printInline(node.type)}`;
        parts.push(
          printLine(node.body ? `${signature} ${printInline(node.body)}` : `${signature};`),
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
        text += node.name;
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
        let text = `new ${printInline(node.expression)}`;
        if (node.typeArguments)
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
        parts.push(`${printInline(node.expression)}!`);
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
        const properties = node.properties.map((property) => printInline(property)).join(', ');
        parts.push(properties ? `{ ${properties} }` : '{}');
        break;
      }

      case TsNodeKind.Parameter: {
        let text = '';
        if (node.modifiers) {
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
          `${printInline(node.expression)}${node.questionDotToken ? '?.' : '.'}${printInline(node.name)}`,
        );
        break;

      case TsNodeKind.PropertyAssignment:
        parts.push(`${printInline(node.name)}: ${printInline(node.initializer)}`);
        break;

      case TsNodeKind.PropertyDeclaration: {
        const modifiers = printModifiers(node.modifiers);
        let text = `${modifiers}${node.name}`;
        if (node.questionToken) text += printInline(node.questionToken);
        if (node.exclamationToken) text += printInline(node.exclamationToken);
        if (node.type) text += `: ${printInline(node.type)}`;
        if (node.initializer) text += ` = ${printInline(node.initializer)}`;
        parts.push(printLine(`${text};`));
        break;
      }

      case TsNodeKind.PropertySignature: {
        let text = '';
        if (node.modifiers) {
          text += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        text += node.name;
        if (node.questionToken) text += printInline(node.questionToken);
        if (node.type) text += `: ${printInline(node.type)}`;
        parts.push(printLine(`${text};`));
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
          printLine(node.expression ? `return ${printInline(node.expression)};` : 'return;'),
        );
        break;

      case TsNodeKind.SatisfiesExpression: {
        parts.push(`${printInline(node.expression)} satisfies ${printInline(node.type)}`);
        break;
      }

      case TsNodeKind.SetAccessor: {
        const modifiers = printModifiers(node.modifiers);
        const parameters = node.parameters.map((parameter) => printInline(parameter)).join(', ');
        const signature = `${modifiers}set ${node.name}(${parameters})`;
        parts.push(
          printLine(node.body ? `${signature} ${printInline(node.body)}` : `${signature};`),
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
        if (node.typeArguments)
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
        parts.push(printLine(`throw ${printInline(node.expression)};`));
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
        const elements = node.elements.map((element) => printInline(element)).join(', ');
        parts.push(`[${elements}]`);
        break;
      }

      case TsNodeKind.TypeAliasDeclaration: {
        let header = '';
        if (node.modifiers) {
          header += `${node.modifiers.map((modifier) => printInline(modifier)).join(' ')} `;
        }
        header += `type ${node.name}`;
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
        parts.push(printLine(`${header} = ${printInline(node.type)};`));
        break;
      }

      case TsNodeKind.TypeLiteral:
        parts.push(
          node.members.length === 0
            ? '{}'
            : `{ ${node.members.map((member) => printInline(member)).join('; ')} }`,
        );
        break;

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
        let text = `${modifiers}${node.name}`;
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
        parts.push(node.types.map((type) => printInline(type)).join(' | '));
        break;

      case TsNodeKind.VariableDeclaration: {
        let text = node.name;
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
        parts.push(printLine(`${printInline(node.declarationList)};`));
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
  };
}

export function printAst(node: TsNode): string {
  return JSON.stringify(node, null, 2);
}
