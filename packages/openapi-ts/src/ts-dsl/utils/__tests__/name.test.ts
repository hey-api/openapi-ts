import { safeRuntimeName } from '../name';

describe('safeRuntimeName', () => {
  const scenarios: ReadonlyArray<{
    name: string;
    output: string;
  }> = [
    // browser globals
    {
      name: 'document',
      output: 'document_',
    },
    {
      name: 'fetch',
      output: 'fetch_',
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
      name: 'AbortController',
      output: 'AbortController_',
    },
    {
      name: 'AbortSignal',
      output: 'AbortSignal_',
    },
    {
      name: 'Blob',
      output: 'Blob_',
    },
    {
      name: 'CustomEvent',
      output: 'CustomEvent_',
    },
    {
      name: 'Event',
      output: 'Event_',
    },
    {
      name: 'EventTarget',
      output: 'EventTarget_',
    },
    {
      name: 'File',
      output: 'File_',
    },
    {
      name: 'FileList',
      output: 'FileList_',
    },
    {
      name: 'FileReader',
      output: 'FileReader_',
    },
    {
      name: 'FormData',
      output: 'FormData_',
    },
    {
      name: 'Headers',
      output: 'Headers_',
    },
    {
      name: 'Request',
      output: 'Request_',
    },
    {
      name: 'Response',
      output: 'Response_',
    },
    {
      name: 'TextDecoder',
      output: 'TextDecoder_',
    },
    {
      name: 'TextEncoder',
      output: 'TextEncoder_',
    },
    {
      name: 'URL',
      output: 'URL_',
    },
    {
      name: 'URLSearchParams',
      output: 'URLSearchParams_',
    },
    // JavaScript globals
    {
      name: 'Array',
      output: 'Array_',
    },
    {
      name: 'ArrayBuffer',
      output: 'ArrayBuffer_',
    },
    {
      name: 'atob',
      output: 'atob_',
    },
    {
      name: 'BigInt',
      output: 'BigInt_',
    },
    {
      name: 'Boolean',
      output: 'Boolean_',
    },
    {
      name: 'btoa',
      output: 'btoa_',
    },
    {
      name: 'clearInterval',
      output: 'clearInterval_',
    },
    {
      name: 'clearTimeout',
      output: 'clearTimeout_',
    },
    {
      name: 'console',
      output: 'console_',
    },
    {
      name: 'crypto',
      output: 'crypto_',
    },
    {
      name: 'DataView',
      output: 'DataView_',
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
      name: 'globalThis',
      output: 'globalThis_',
    },
    {
      name: 'Infinity',
      output: 'Infinity_',
    },
    {
      name: 'Intl',
      output: 'Intl_',
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
      name: 'NaN',
      output: 'NaN_',
    },
    {
      name: 'Number',
      output: 'Number_',
    },
    {
      name: 'Object',
      output: 'Object_',
    },
    {
      name: 'performance',
      output: 'performance_',
    },
    {
      name: 'Promise',
      output: 'Promise_',
    },
    {
      name: 'Proxy',
      output: 'Proxy_',
    },
    {
      name: 'queueMicrotask',
      output: 'queueMicrotask_',
    },
    {
      name: 'Reflect',
      output: 'Reflect_',
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
      name: 'setInterval',
      output: 'setInterval_',
    },
    {
      name: 'setTimeout',
      output: 'setTimeout_',
    },
    {
      name: 'String',
      output: 'String_',
    },
    {
      name: 'structuredClone',
      output: 'structuredClone_',
    },
    {
      name: 'Symbol',
      output: 'Symbol_',
    },
    {
      name: 'WeakMap',
      output: 'WeakMap_',
    },
    {
      name: 'WeakSet',
      output: 'WeakSet_',
    },
    // JavaScript keywords
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
    // Node.js globals
    {
      name: '__dirname',
      output: '__dirname_',
    },
    {
      name: '__filename',
      output: '__filename_',
    },
    {
      name: 'exports',
      output: 'exports_',
    },
    {
      name: 'global',
      output: 'global_',
    },
    {
      name: 'module',
      output: 'module_',
    },
    {
      name: 'process',
      output: 'process_',
    },
    {
      name: 'require',
      output: 'require_',
    },
    {
      name: 'Buffer',
      output: 'Buffer_',
    },
    // TypeScript keywords
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
