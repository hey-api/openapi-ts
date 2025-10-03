import '@hey-api/codegen-core';

declare module '@hey-api/codegen-core' {
  interface ProjectRenderMeta {
    /**
     * If specified, this will be the file extension used when importing
     * other modules. By default, we don't add a file extension and let the
     * runtime resolve it.
     *
     * @default null
     */
    importFileExtension?: (string & {}) | null;
  }

  interface SymbolMeta {
    /**
     * Name of the plugin that registered this symbol.
     */
    pluginName?: string;
  }
}
