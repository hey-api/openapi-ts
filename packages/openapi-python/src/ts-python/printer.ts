import type { PyNode } from './nodes/base';
import { PyNodeKind } from './nodes/kinds';

export interface PyPrinterOptions {
  indentSize?: number;
}

export function createPrinter(options?: PyPrinterOptions) {
  const indentSize = options?.indentSize ?? 4;

  let indentLevel = 0;

  function processComments(
    parts: Array<string>,
    lines: ReadonlyArray<string>,
    indent?: boolean,
  ): void {
    if (indent) indentLevel += 1;
    parts.push(...lines.map((line) => printLine(`# ${line}`)));
    if (indent) indentLevel -= 1;
  }

  function printLine(line: string): string {
    return ' '.repeat(indentLevel * indentSize) + line;
  }

  function printNode(node: PyNode): string {
    const parts: Array<string> = [];

    if (node.leadingComments) {
      processComments(parts, node.leadingComments);
    }

    let indentTrailingComments = false;

    switch (node.kind) {
      case PyNodeKind.Assignment:
        parts.push(printLine(`${printNode(node.target)} = ${printNode(node.value)}`));
        break;

      case PyNodeKind.AsyncExpression:
        parts.push(`async ${printNode(node.expression)}`);
        break;

      case PyNodeKind.AugmentedAssignment:
        parts.push(
          printLine(`${printNode(node.target)} ${node.operator} ${printNode(node.value)}`),
        );
        break;

      case PyNodeKind.AwaitExpression:
        parts.push(`await ${printNode(node.expression)}`);
        break;

      case PyNodeKind.BinaryExpression:
        parts.push(`${printNode(node.left)} ${node.operator} ${printNode(node.right)}`);
        break;

      case PyNodeKind.Block:
        indentLevel += 1;
        if (node.statements.length) {
          parts.push(...node.statements.map(printNode));
        } else {
          parts.push(printLine('pass'));
        }
        indentLevel -= 1;
        break;

      case PyNodeKind.BreakStatement:
        parts.push(printLine('break'));
        break;

      case PyNodeKind.CallExpression:
        parts.push(`${printNode(node.callee)}(${node.args.map(printNode).join(', ')})`);
        break;

      case PyNodeKind.ClassDeclaration: {
        indentTrailingComments = true;
        if (node.decorators) {
          parts.push(...node.decorators.map((decorator) => printLine(`@${printNode(decorator)}`)));
        }
        const bases = node.baseClasses?.length
          ? `(${node.baseClasses.map(printNode).join(', ')})`
          : '';
        parts.push(printLine(`class ${node.name}${bases}:`));
        if (node.docstring) {
          indentLevel += 1;
          parts.push(printLine(`"""${node.docstring}"""`), '');
          indentLevel -= 1;
        }
        parts.push(printNode(node.body));
        break;
      }

      case PyNodeKind.Comment:
        parts.push(printLine(`# ${node.text}`));
        break;

      case PyNodeKind.ContinueStatement:
        parts.push(printLine('continue'));
        break;

      case PyNodeKind.DictComprehension: {
        const asyncPrefix = node.isAsync ? 'async ' : '';
        const children: Array<string> = [
          `${printNode(node.key)}: ${printNode(node.value)} ${asyncPrefix}for ${printNode(node.target)} in ${printNode(node.iterable)}`,
        ];
        if (node.ifs) {
          for (const condition of node.ifs) {
            children.push(`if ${printNode(condition)}`);
          }
        }
        parts.push(`{${children.join(' ')}}`);
        break;
      }

      case PyNodeKind.DictExpression: {
        const entries = node.entries
          .map(({ key, value }) => `${printNode(key)}: ${printNode(value)}`)
          .join(', ');
        parts.push(`{${entries}}`);
        break;
      }

      case PyNodeKind.EmptyStatement:
        parts.push('');
        break;

      case PyNodeKind.ExpressionStatement:
        parts.push(printLine(printNode(node.expression)));
        break;

      case PyNodeKind.ForStatement:
        parts.push(printLine(`for ${printNode(node.target)} in ${printNode(node.iterable)}:`));
        parts.push(printNode(node.body));
        if (node.elseBlock) {
          parts.push(`${printLine('else:')}`);
          parts.push(`${printNode(node.elseBlock)}`);
        }
        break;

      case PyNodeKind.FStringExpression: {
        const children = node.parts.map((part) =>
          typeof part === 'string' ? part : `{${printNode(part)}}`,
        );
        parts.push(`f"${children.join('')}"`);
        break;
      }

      case PyNodeKind.FunctionDeclaration: {
        if (node.decorators) {
          parts.push(...node.decorators.map((decorator) => printLine(`@${printNode(decorator)}`)));
        }
        const modifiers = node.modifiers?.map(printNode).join(' ') ?? '';
        const defPrefix = modifiers ? `${modifiers} def` : 'def';
        const parameters = node.parameters.map((parameter) => {
          const children: Array<string> = [parameter.name];
          if (parameter.annotation) children.push(`: ${printNode(parameter.annotation)}`);
          if (parameter.defaultValue) children.push(` = ${printNode(parameter.defaultValue)}`);
          return children.join('');
        });
        const returnAnnotation = node.returnType ? ` -> ${printNode(node.returnType)}` : '';
        parts.push(
          printLine(`${defPrefix} ${node.name}(${parameters.join(', ')})${returnAnnotation}:`),
        );
        if (node.docstring) {
          indentLevel += 1;
          parts.push(printLine(`"""${node.docstring}"""`), '');
          indentLevel -= 1;
        }
        parts.push(printNode(node.body));
        break;
      }

      case PyNodeKind.GeneratorExpression: {
        const asyncPrefix = node.isAsync ? 'async ' : '';
        const children: Array<string> = [
          `${printNode(node.element)} ${asyncPrefix}for ${printNode(node.target)} in ${printNode(node.iterable)}`,
        ];
        if (node.ifs) {
          for (const condition of node.ifs) {
            children.push(`if ${printNode(condition)}`);
          }
        }
        parts.push(`(${children.join(' ')})`);
        break;
      }

      case PyNodeKind.Identifier:
        parts.push(node.name);
        break;

      case PyNodeKind.IfStatement:
        parts.push(printLine(`if ${printNode(node.condition)}:`));
        parts.push(`${printNode(node.thenBlock)}`);
        if (node.elseBlock) {
          parts.push(`${printLine('else:')}`);
          parts.push(`${printNode(node.elseBlock)}`);
        }
        break;

      case PyNodeKind.ImportStatement: {
        const fromPrefix = node.isFrom ? `from ${node.module} ` : '';
        if (fromPrefix) {
          if (node.names && node.names.length > 0) {
            const imports = node.names
              .map(({ alias, name }) => (alias ? `${name} as ${alias}` : name))
              .join(', ');
            parts.push(printLine(`${fromPrefix}import ${imports}`));
          } else {
            parts.push(printLine(`${fromPrefix}import *`));
          }
        } else {
          if (node.names && node.names.length > 0) {
            const imports = node.names
              .map(({ alias, name }) => (alias ? `${name} as ${alias}` : name))
              .join(', ');
            parts.push(printLine(`import ${imports}`));
          } else {
            parts.push(printLine(`import ${node.module}`));
          }
        }
        break;
      }

      case PyNodeKind.LambdaExpression: {
        const parameters = node.parameters.map((parameter) => {
          const children: Array<string> = [parameter.name];
          if (parameter.annotation) children.push(`: ${printNode(parameter.annotation)}`);
          if (parameter.defaultValue) children.push(` = ${printNode(parameter.defaultValue)}`);
          return children.join('');
        });
        parts.push(`lambda ${parameters.join(', ')}: ${printNode(node.expression)}`);
        break;
      }

      case PyNodeKind.ListComprehension: {
        const asyncPrefix = node.isAsync ? 'async ' : '';
        const children: Array<string> = [
          `${printNode(node.element)} ${asyncPrefix}for ${printNode(node.target)} in ${printNode(node.iterable)}`,
        ];
        if (node.ifs) {
          for (const condition of node.ifs) {
            children.push(`if ${printNode(condition)}`);
          }
        }
        parts.push(`[${children.join(' ')}]`);
        break;
      }

      case PyNodeKind.ListExpression:
        parts.push(`[${node.elements.map(printNode).join(', ')}]`);
        break;

      case PyNodeKind.Literal:
        if (typeof node.value === 'string') {
          parts.push(`"${node.value}"`);
        } else if (typeof node.value === 'boolean') {
          parts.push(node.value ? 'True' : 'False');
        } else if (node.value === null) {
          parts.push('None');
        } else {
          parts.push(String(node.value));
        }
        break;

      case PyNodeKind.MemberExpression:
        parts.push(`${printNode(node.object)}.${printNode(node.member)}`);
        break;

      case PyNodeKind.RaiseStatement:
        if (node.expression) {
          parts.push(printLine(`raise ${printNode(node.expression)}`));
        } else {
          parts.push(printLine('raise'));
        }
        break;

      case PyNodeKind.ReturnStatement:
        if (node.expression) {
          parts.push(printLine(`return ${printNode(node.expression)}`));
        } else {
          parts.push(printLine('return'));
        }
        break;

      case PyNodeKind.SetComprehension: {
        const asyncPrefix = node.isAsync ? 'async ' : '';
        const children: Array<string> = [
          `${printNode(node.element)} ${asyncPrefix}for ${printNode(node.target)} in ${printNode(node.iterable)}`,
        ];
        if (node.ifs) {
          for (const condition of node.ifs) {
            children.push(`if ${printNode(condition)}`);
          }
        }
        parts.push(`{${children.join(' ')}}`);
        break;
      }

      case PyNodeKind.SetExpression: {
        if (!node.elements.length) {
          parts.push('set()');
        } else {
          parts.push(`{${node.elements.map(printNode).join(', ')}}`);
        }
        break;
      }

      case PyNodeKind.SourceFile:
        if (node.docstring) {
          parts.push(printLine(`"""${node.docstring}"""`), '');
        }
        parts.push(...node.statements.map(printNode));
        break;

      case PyNodeKind.TryStatement: {
        parts.push(printLine('try:'), printNode(node.tryBlock));
        if (node.exceptClauses) {
          for (const clause of node.exceptClauses) {
            const type = clause.exceptionType ? ` ${printNode(clause.exceptionType)}` : '';
            const name = clause.exceptionName ? ` as ${printNode(clause.exceptionName)}` : '';
            parts.push(printLine(`except${type}${name}:`), printNode(clause.block));
          }
        }
        if (node.elseBlock) {
          parts.push(printLine(`else:`), printNode(node.elseBlock));
        }
        if (node.finallyBlock) {
          parts.push(printLine(`finally:`), printNode(node.finallyBlock));
        }
        break;
      }

      case PyNodeKind.TupleExpression: {
        // Single-element tuple needs trailing comma
        const trailingComma = node.elements.length === 1 ? ',' : '';
        parts.push(`(${node.elements.map(printNode).join(', ')}${trailingComma})`);
        break;
      }

      case PyNodeKind.WhileStatement: {
        parts.push(printLine(`while ${printNode(node.condition)}:`));
        parts.push(printNode(node.body));
        if (node.elseBlock) {
          parts.push(`${printLine('else:')}`);
          parts.push(`${printNode(node.elseBlock)}`);
        }
        break;
      }

      case PyNodeKind.WithStatement: {
        const modifiers = node.modifiers?.map(printNode).join(' ') ?? '';
        const withPrefix = modifiers ? `${modifiers} with` : 'with';
        const items = node.items
          .map((item) =>
            item.alias
              ? `${printNode(item.contextExpr)} as ${printNode(item.alias)}`
              : printNode(item.contextExpr),
          )
          .join(', ');
        parts.push(printLine(`${withPrefix} ${items}:`));
        parts.push(printNode(node.body));
        break;
      }

      case PyNodeKind.YieldExpression:
        if (node.value) {
          parts.push(`yield ${printNode(node.value)}`);
        } else {
          parts.push('yield');
        }
        break;

      case PyNodeKind.YieldFromExpression:
        parts.push(`yield from ${printNode(node.expression)}`);
        break;

      default:
        // @ts-expect-error
        throw new Error(`Unsupported node kind: ${node.kind}`);
    }

    if (node.trailingComments) {
      processComments(parts, node.trailingComments, indentTrailingComments);
    }

    return parts.join('\n');
  }

  function printFile(node: PyNode): string {
    const parts: Array<string> = [printNode(node), ''];
    return parts.join('\n');
  }

  return {
    printFile,
  };
}

export function printAst(node: PyNode): string {
  return JSON.stringify(node, null, 2);
}
