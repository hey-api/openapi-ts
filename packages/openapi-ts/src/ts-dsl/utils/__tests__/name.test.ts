import { describe, expect, it } from 'vitest';

import { safeSymbolName } from '../name';

describe('safeSymbolName', () => {
  const scenarios: ReadonlyArray<{
    name: string;
    output: string;
  }> = [
    {
      name: 'document',
      output: '_document',
    },
    {
      name: 'history',
      output: '_history',
    },
    {
      name: 'location',
      output: '_location',
    },
    {
      name: 'navigator',
      output: '_navigator',
    },
    {
      name: 'window',
      output: '_window',
    },
    {
      name: 'console',
      output: '_console',
    },
    {
      name: 'Array',
      output: '_Array',
    },
    {
      name: 'Date',
      output: '_Date',
    },
    {
      name: 'Error',
      output: '_Error',
    },
    {
      name: 'Function',
      output: '_Function',
    },
    {
      name: 'JSON',
      output: '_JSON',
    },
    {
      name: 'Map',
      output: '_Map',
    },
    {
      name: 'Math',
      output: '_Math',
    },
    {
      name: 'Object',
      output: '_Object',
    },
    {
      name: 'Promise',
      output: '_Promise',
    },
    {
      name: 'RegExp',
      output: '_RegExp',
    },
    {
      name: 'Set',
      output: '_Set',
    },
    {
      name: 'WeakMap',
      output: '_WeakMap',
    },
    {
      name: 'WeakSet',
      output: '_WeakSet',
    },
    {
      name: 'arguments',
      output: '_arguments',
    },
    {
      name: 'async',
      output: '_async',
    },
    {
      name: 'await',
      output: '_await',
    },
    {
      name: 'break',
      output: '_break',
    },
    {
      name: 'case',
      output: '_case',
    },
    {
      name: 'catch',
      output: '_catch',
    },
    {
      name: 'class',
      output: '_class',
    },
    {
      name: 'const',
      output: '_const',
    },
    {
      name: 'continue',
      output: '_continue',
    },
    {
      name: 'debugger',
      output: '_debugger',
    },
    {
      name: 'default',
      output: '_default',
    },
    {
      name: 'delete',
      output: '_delete',
    },
    {
      name: 'do',
      output: '_do',
    },
    {
      name: 'else',
      output: '_else',
    },
    {
      name: 'enum',
      output: '_enum',
    },
    {
      name: 'eval',
      output: '_eval',
    },
    {
      name: 'export',
      output: '_export',
    },
    {
      name: 'extends',
      output: '_extends',
    },
    {
      name: 'false',
      output: '_false',
    },
    {
      name: 'finally',
      output: '_finally',
    },
    {
      name: 'for',
      output: '_for',
    },
    {
      name: 'from',
      output: '_from',
    },
    {
      name: 'function',
      output: '_function',
    },
    {
      name: 'if',
      output: '_if',
    },
    {
      name: 'implements',
      output: '_implements',
    },
    {
      name: 'import',
      output: '_import',
    },
    {
      name: 'in',
      output: '_in',
    },
    {
      name: 'instanceof',
      output: '_instanceof',
    },
    {
      name: 'interface',
      output: '_interface',
    },
    {
      name: 'let',
      output: '_let',
    },
    {
      name: 'new',
      output: '_new',
    },
    {
      name: 'null',
      output: '_null',
    },
    {
      name: 'package',
      output: '_package',
    },
    {
      name: 'private',
      output: '_private',
    },
    {
      name: 'protected',
      output: '_protected',
    },
    {
      name: 'public',
      output: '_public',
    },
    {
      name: 'return',
      output: '_return',
    },
    {
      name: 'static',
      output: '_static',
    },
    {
      name: 'super',
      output: '_super',
    },
    {
      name: 'switch',
      output: '_switch',
    },
    {
      name: 'this',
      output: '_this',
    },
    {
      name: 'throw',
      output: '_throw',
    },
    {
      name: 'true',
      output: '_true',
    },
    {
      name: 'try',
      output: '_try',
    },
    {
      name: 'typeof',
      output: '_typeof',
    },
    {
      name: 'var',
      output: '_var',
    },
    {
      name: 'void',
      output: '_void',
    },
    {
      name: 'while',
      output: '_while',
    },
    {
      name: 'with',
      output: '_with',
    },
    {
      name: 'yield',
      output: '_yield',
    },
    {
      name: 'global',
      output: '_global',
    },
    {
      name: 'process',
      output: '_process',
    },
    {
      name: 'Buffer',
      output: '_Buffer',
    },
    {
      name: 'any',
      output: '_any',
    },
    {
      name: 'as',
      output: '_as',
    },
    {
      name: 'bigint',
      output: '_bigint',
    },
    {
      name: 'boolean',
      output: '_boolean',
    },
    {
      name: 'namespace',
      output: '_namespace',
    },
    {
      name: 'never',
      output: '_never',
    },
    {
      name: 'null',
      output: '_null',
    },
    {
      name: 'number',
      output: '_number',
    },
    {
      name: 'string',
      output: '_string',
    },
    {
      name: 'symbol',
      output: '_symbol',
    },
    {
      name: 'type',
      output: '_type',
    },
    {
      name: 'undefined',
      output: '_undefined',
    },
    {
      name: 'unknown',
      output: '_unknown',
    },
    {
      name: 'void',
      output: '_void',
    },
  ];

  it.each(scenarios)(
    'transforms $name -> $output',
    async ({ name, output }) => {
      expect(safeSymbolName(name)).toEqual(output);
    },
  );
});
