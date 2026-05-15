import type { CodegenInput, CodegenOutput, CodegenParams } from './codegen-url';
import { CODEGEN_DEFAULT_INPUT, CODEGEN_DEFAULT_OUTPUT, parseCodegenUrl } from './codegen-url';
import { getSynced, SYNC_STORAGE_PREFIX } from './sync-storage';

export const CODEGEN_INPUT_ATTR = 'codegenInput';
export const CODEGEN_OUTPUT_ATTR = 'codegenOutput';

export type CodegenParamsEvent = CustomEvent<CodegenParams>;

declare global {
  interface DocumentEventMap {
    [PARAMS_CUSTOM_EVENT]: CodegenParamsEvent;
  }
}

export const CODEGEN_INPUT_STORAGE_KEY = `${SYNC_STORAGE_PREFIX}toggle:codegen-input`;
export const CODEGEN_OUTPUT_STORAGE_KEY = `${SYNC_STORAGE_PREFIX}toggle:codegen-output`;
export const PARAMS_CUSTOM_EVENT = 'hey-api-codegen-params-change';

export function resolveCodegenParams(): CodegenParams {
  const fromUrl = parseCodegenUrl(window.location.pathname);
  if (fromUrl) return fromUrl;
  return {
    input: getSynced('toggle:codegen-input') ?? CODEGEN_DEFAULT_INPUT,
    output: getSynced('toggle:codegen-output') ?? CODEGEN_DEFAULT_OUTPUT,
  };
}

export function broadcastCodegenParams(params: CodegenParams): void {
  document.documentElement.dataset[CODEGEN_INPUT_ATTR] = params.input;
  document.documentElement.dataset[CODEGEN_OUTPUT_ATTR] = params.output;
  document.dispatchEvent(new CustomEvent(PARAMS_CUSTOM_EVENT, { detail: params }));
}

export function onCodegenParams(callback: (params: CodegenParams) => void): () => void {
  const handler = (e: CodegenParamsEvent) => callback(e.detail);
  document.addEventListener(PARAMS_CUSTOM_EVENT, handler);

  const input = document.documentElement.dataset[CODEGEN_INPUT_ATTR] as CodegenInput | undefined;
  const output = document.documentElement.dataset[CODEGEN_OUTPUT_ATTR] as CodegenOutput | undefined;
  if (input && output) callback({ input, output });

  return () => document.removeEventListener(PARAMS_CUSTOM_EVENT, handler);
}
