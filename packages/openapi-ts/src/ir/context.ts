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
  /**
   * Configuration for parsing and generating the output. This
   * is a mix of user-provided and default values.
   */
  public config: Config;
  /**
   * A map of files that will be generated from `spec`.
   */
  public files: Files;
  /**
   * Intermediate representation model obtained from `spec`.
   */
  public ir: IR;
  public parserConfig: ParserConfig;
  /**
   * Resolved specification from `input`.
   */
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

  /**
   * Returns a specific file by ID from `files`.
   */
  public file({ id }: Pick<ContextFile, 'id'>): TypeScriptFile | undefined {
    return this.files[id];
  }

  // TODO: parser - works the same as resolveRef, but for IR schemas.
  // for now, they map 1:1, but if they diverge (like with OpenAPI 2.0),
  // we will want to rewrite $refs at parse time, so they continue pointing
  // to the correct IR location
  public resolveIrRef<T>($ref: string) {
    return resolveRef<T>({
      $ref,
      spec: this.ir,
    });
  }

  /**
   * Returns a resolved reference from `spec`.
   */
  public resolveRef<T>($ref: string) {
    return resolveRef<T>({
      $ref,
      spec: this.spec,
    });
  }
}
