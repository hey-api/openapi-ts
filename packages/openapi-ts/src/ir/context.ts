import path from 'node:path';

import { TypeScriptFile } from '../generate/files';
import type { Config, StringCase } from '../types/config';
import type { Files } from '../types/utils';
import { resolveRef } from '../utils/ref';
import type { IR } from './types';

interface ContextFile {
  /**
   * Should the exports from this file be re-exported in the index barrel file?
   */
  exportFromIndex?: boolean;
  /**
   * Unique file identifier.
   */
  id: string;
  /**
   * Define casing for identifiers in this file.
   */
  identifierCase?: StringCase;
  /**
   * Relative file path to the output path.
   * @example
   * 'bar/foo.ts'
   */
  path: string;
}

interface Events {
  /**
   * Called after parsing.
   */
  after: () => void;
  /**
   * Called before parsing.
   */
  before: () => void;
  operation: (args: {
    method: keyof IR.PathItemObject;
    operation: IR.OperationObject;
    path: string;
  }) => void;
  parameter: (args: {
    $ref: string;
    name: string;
    parameter: IR.ParameterObject;
  }) => void;
  requestBody: (args: {
    $ref: string;
    name: string;
    requestBody: IR.RequestBodyObject;
  }) => void;
  schema: (args: {
    $ref: string;
    name: string;
    schema: IR.SchemaObject;
  }) => void;
  server: (args: { server: IR.ServerObject }) => void;
}

type Listeners = {
  [T in keyof Events]?: Array<Events[T]>;
};

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
  public ir: IR.Model;
  /**
   * Resolved specification from `input`.
   */
  public spec: Spec;

  /**
   * A map of event listeners.
   */
  private listeners: Listeners;

  constructor({ config, spec }: { config: Config; spec: Spec }) {
    this.config = config;
    this.files = {};
    this.ir = {};
    this.listeners = {};
    this.spec = spec;
  }

  /**
   * Notify all event listeners about `event`.
   */
  public async broadcast<T extends keyof Events>(
    event: T,
    ...args: Parameters<Events[T]>
  ): Promise<void> {
    if (!this.listeners[event]) {
      return;
    }

    await Promise.all(
      this.listeners[event].map((callbackFn, index) => {
        try {
          // @ts-expect-error
          const response = callbackFn(...args);
          return Promise.resolve(response);
        } catch (error) {
          console.error(
            `🔥 Event broadcast: "${event}"\nindex: ${index}\narguments: ${JSON.stringify(args, null, 2)}`,
          );
          throw error;
        }
      }),
    );
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
      exportFromIndex: file.exportFromIndex,
      identifierCase: file.identifierCase,
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

  /**
   * Register a new `event` listener.
   */
  public subscribe<T extends keyof Events>(
    event: T,
    callbackFn: Events[T],
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callbackFn);
  }
}
