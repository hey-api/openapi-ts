export type CodegenInput = 'openapi' | 'asyncapi';
export type CodegenOutput = 'typescript' | 'python';

export interface CodegenParams {
  input: CodegenInput;
  output: CodegenOutput;
}

export const CODEGEN_DEFAULT_INPUT: CodegenInput = 'openapi';
export const CODEGEN_DEFAULT_OUTPUT: CodegenOutput = 'typescript';

export const CODEGEN_URL_PATTERN = /\/codegen\/(asyncapi|openapi)\/(typescript|python)/;

export function parseCodegenUrl(pathname: string): CodegenParams | null {
  const match = pathname.match(CODEGEN_URL_PATTERN);
  if (!match) return null;
  return {
    input: match[1] as CodegenInput,
    output: match[2] as CodegenOutput,
  };
}
