import path from 'node:path';

import { TypeScriptFile } from '../generate/files';
import type { ParserConfig } from '../openApi/config';
import type { Config } from '../types/config';
import type { Files } from '../types/utils';
import { resolveRef } from '../utils/ref';
import type { IR } from './ir';

interface ContextFile {
  /**
   * Unique file identifier.
   */
  id: string;
  /**
   * Relative file path to the output path.
   * @example
   * 'bar/foo.ts'
   */
  path: string;
}

export class IRContext<Spec extends Record<string, any> = any> {
  public config: Config;
  public files: Files;
  public ir: IR;
  public parserConfig: ParserConfig;
  public spec: Spec;

  constructor({
    config,
    parserConfig,
    spec,
  }: {
    config: Config;
    parserConfig: ParserConfig;
    spec: Spec;
  }) {
    this.config = config;
    this.files = {};
    this.ir = {};
    this.parserConfig = parserConfig;
    this.spec = spec;
  }

  /**
   * Create and return a new TypeScript file. Also set the current file context
   * to the newly created file.
   */
  public createFile(file: ContextFile): TypeScriptFile {
    // TODO: parser - handle attempt to create duplicate
    const outputParts = file.path.split('/');
    const outputDir = path.resolve(
      this.config.output.path,
      ...outputParts.slice(0, outputParts.length - 1),
    );
    const createdFile = new TypeScriptFile({
      dir: outputDir,
      name: `${outputParts[outputParts.length - 1]}.ts`,
    });
    this.files[file.id] = createdFile;
    return createdFile;
  }

  public file({ id }: Pick<ContextFile, 'id'>): TypeScriptFile | undefined {
    return this.files[id];
  }

  public resolveRef<T>($ref: string) {
    return resolveRef<T>({
      $ref,
      spec: this.spec,
    });
  }
}
