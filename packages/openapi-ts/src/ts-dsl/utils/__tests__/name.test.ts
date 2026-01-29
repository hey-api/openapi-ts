import { safeRuntimeName } from '../name';

describe('safeRuntimeName', () => {
  const scenarios: ReadonlyArray<{
    name: string;
    output: string;
  }> = [
    {
      name: 'document',
      output: 'document_',
    },
    {
      name: 'history',
      output: 'history_',
    },
    {
      name: 'location',
      output: 'location_',
    },
    {
      name: 'navigator',
      output: 'navigator_',
    },
    {
      name: 'window',
      output: 'window_',
    },
    {
      name: 'console',
      output: 'console_',
    },
    {
      name: 'Array',
      output: 'Array_',
    },
    {
      name: 'Date',
      output: 'Date_',
    },
    {
      name: 'Error',
      output: 'Error_',
    },
    {
      name: 'Function',
      output: 'Function_',
    },
    {
      name: 'JSON',
      output: 'JSON_',
    },
    {
      name: 'Map',
      output: 'Map_',
    },
    {
      name: 'Math',
      output: 'Math_',
    },
    {
      name: 'Object',
      output: 'Object_',
    },
    {
      name: 'Promise',
      output: 'Promise_',
    },
    {
      name: 'RegExp',
      output: 'RegExp_',
    },
    {
      name: 'Set',
      output: 'Set_',
    },
    {
      name: 'WeakMap',
      output: 'WeakMap_',
    },
    {
      name: 'WeakSet',
      output: 'WeakSet_',
    },
    {
      name: 'arguments',
      output: 'arguments_',
    },
    {
      name: 'async',
      output: 'async_',
    },
    {
      name: 'await',
      output: 'await_',
    },
    {
      name: 'break',
      output: 'break_',
    },
    {
      name: 'case',
      output: 'case_',
    },
    {
      name: 'catch',
      output: 'catch_',
    },
    {
      name: 'class',
      output: 'class_',
    },
    {
      name: 'const',
      output: 'const_',
    },
    {
      name: 'continue',
      output: 'continue_',
    },
    {
      name: 'debugger',
      output: 'debugger_',
    },
    {
      name: 'default',
      output: 'default_',
    },
    {
      name: 'delete',
      output: 'delete_',
    },
    {
      name: 'do',
      output: 'do_',
    },
    {
      name: 'else',
      output: 'else_',
    },
    {
      name: 'enum',
      output: 'enum_',
    },
    {
      name: 'eval',
      output: 'eval_',
    },
    {
      name: 'export',
      output: 'export_',
    },
    {
      name: 'extends',
      output: 'extends_',
    },
    {
      name: 'false',
      output: 'false_',
    },
    {
      name: 'finally',
      output: 'finally_',
    },
    {
      name: 'for',
      output: 'for_',
    },
    {
      name: 'from',
      output: 'from_',
    },
    {
      name: 'function',
      output: 'function_',
    },
    {
      name: 'if',
      output: 'if_',
    },
    {
      name: 'implements',
      output: 'implements_',
    },
    {
      name: 'import',
      output: 'import_',
    },
    {
      name: 'in',
      output: 'in_',
    },
    {
      name: 'instanceof',
      output: 'instanceof_',
    },
    {
      name: 'interface',
      output: 'interface_',
    },
    {
      name: 'let',
      output: 'let_',
    },
    {
      name: 'new',
      output: 'new_',
    },
    {
      name: 'null',
      output: 'null_',
    },
    {
      name: 'package',
      output: 'package_',
    },
    {
      name: 'private',
      output: 'private_',
    },
    {
      name: 'protected',
      output: 'protected_',
    },
    {
      name: 'public',
      output: 'public_',
    },
    {
      name: 'return',
      output: 'return_',
    },
    {
      name: 'static',
      output: 'static_',
    },
    {
      name: 'super',
      output: 'super_',
    },
    {
      name: 'switch',
      output: 'switch_',
    },
    {
      name: 'this',
      output: 'this_',
    },
    {
      name: 'throw',
      output: 'throw_',
    },
    {
      name: 'true',
      output: 'true_',
    },
    {
      name: 'try',
      output: 'try_',
    },
    {
      name: 'typeof',
      output: 'typeof_',
    },
    {
      name: 'var',
      output: 'var_',
    },
    {
      name: 'void',
      output: 'void_',
    },
    {
      name: 'while',
      output: 'while_',
    },
    {
      name: 'with',
      output: 'with_',
    },
    {
      name: 'yield',
      output: 'yield_',
    },
    {
      name: 'global',
      output: 'global_',
    },
    {
      name: 'process',
      output: 'process_',
    },
    {
      name: 'Buffer',
      output: 'Buffer_',
    },
    {
      name: 'any',
      output: 'any_',
    },
    {
      name: 'as',
      output: 'as_',
    },
    {
      name: 'bigint',
      output: 'bigint_',
    },
    {
      name: 'boolean',
      output: 'boolean_',
    },
    {
      name: 'namespace',
      output: 'namespace_',
    },
    {
      name: 'never',
      output: 'never_',
    },
    {
      name: 'null',
      output: 'null_',
    },
    {
      name: 'number',
      output: 'number_',
    },
    {
      name: 'string',
      output: 'string_',
    },
    {
      name: 'symbol',
      output: 'symbol_',
    },
    {
      name: 'type',
      output: 'type_',
    },
    {
      name: 'undefined',
      output: 'undefined_',
    },
    {
      name: 'unknown',
      output: 'unknown_',
    },
    {
      name: 'void',
      output: 'void_',
    },
  ];

  it.each(scenarios)('transforms $name -> $output', async ({ name, output }) => {
    expect(safeRuntimeName(name)).toEqual(output);
  });
});
