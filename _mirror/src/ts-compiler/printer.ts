import type { TsNode } from './nodes/base';
import { TsNodeKind } from './nodes/kinds';

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

const DEFAULT_INDENT_SIZE = 2;
const DEFAULT_SEMICOLONS = true;

export function createPrinter(options?: TsPrinterOptions) {
  const indentSize = options?.indentSize ?? DEFAULT_INDENT_SIZE;
  const semicolons = options?.semicolons ?? DEFAULT_SEMICOLONS;

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
    if (line === '') return '';
    return ' '.repeat(indentLevel * indentSize) + line;
  }

  function printNode(node: TsNode): string {
    const parts: Array<string> = [];

    if (node.leadingComments) {
      printComments(parts, node.leadingComments);
    }

    switch (node.kind) {
      case TsNodeKind.Assignment: {
        const target = printNode(node.target);
        if (node.type) {
          const type = printNode(node.type);
          if (node.value) {
            parts.push(printLine(`${target}: ${type} = ${printNode(node.value)}`));
          } else {
            parts.push(printLine(`${target}: ${type}`));
          }
        } else {
          parts.push(printLine(`${target} = ${printNode(node.value!)}`));
        }
        if (semicolons) {
          const lastIndex = parts.length - 1;
          parts[lastIndex] += ';';
        }
        break;
      }

      case TsNodeKind.Identifier:
        parts.push(node.text);
        break;

      case TsNodeKind.Literal:
        if (typeof node.value === 'string') {
          parts.push(`"${node.value}"`);
        } else if (typeof node.value === 'boolean') {
          parts.push(node.value ? 'true' : 'false');
        } else if (node.value === null) {
          parts.push('null');
        } else {
          parts.push(String(node.value));
        }
        break;

      case TsNodeKind.SourceFile:
        parts.push(...node.statements.map(printNode));
        break;

      case TsNodeKind.VariableStatement: {
        const keyword = node.keyword;
        const name = node.name;
        let line = `${keyword} ${name}`;
        if (node.typeAnnotation) {
          line += `: ${printNode(node.typeAnnotation)}`;
        }
        if (node.initializer) {
          line += ` = ${printNode(node.initializer)}`;
        }
        if (semicolons) {
          line += ';';
        }
        parts.push(printLine(line));
        break;
      }

      default:
        throw new Error(`Unsupported node kind: ${(node as { kind: string }).kind}`);
    }

    if (node.trailingComments) {
      printComments(parts, node.trailingComments);
    }

    return parts.join('\n');
  }

  function printFile(node: TsNode): string {
    const parts: Array<string> = [printNode(node), ''];
    return parts.join('\n');
  }

  return {
    printFile,
  };
}

export function printAst(node: TsNode): string {
  return JSON.stringify(node, null, 2);
}
