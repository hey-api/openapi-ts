import path from 'node:path';

import type { ExportModule, ImportModule } from '../bindings';
import { fileBrand } from '../brands';
import { debug } from '../debug';
import type { Language } from '../languages/types';
import type { INode } from '../nodes/node';
import type { NameScopes } from '../planner/types';
import type { IProject } from '../project/types';
import type { Renderer } from '../renderer';
import type { IFileIn } from './types';

export class File {
  /**
   * Exports from this file.
   */
  private _exports: Array<ExportModule> = [];
  /**
   * File extension (e.g. `.ts`).
   */
  private _extension?: string;
  /**
   * Actual emitted file path, including extension and directories.
   */
  private _finalPath?: string;
  /**
   * Imports to this file.
   */
  private _imports: Array<ImportModule> = [];
  /**
   * Language of the file.
   */
  private _language?: Language;
  /**
   * Logical, extension-free path used for planning and routing.
   */
  private _logicalFilePath: string;
  /**
   * Base name of the file (without extension).
   */
  private _name?: string;
  /**
   * Syntax nodes contained in this file.
   */
  private _nodes: Array<INode> = [];
  /**
   * Renderer assigned to this file.
   */
  private _renderer?: Renderer;

  /** Brand used for identifying files. */
  readonly '~brand' = fileBrand;
  /** All names defined in this file, including local scopes. */
  allNames: NameScopes = new Map();
  /** Whether this file is external to the project. */
  external: boolean;
  /** Unique identifier for the file. */
  readonly id: number;
  /** The project this file belongs to. */
  readonly project: IProject;
  /** Names declared at the top level of the file. */
  topLevelNames: NameScopes = new Map();

  constructor(input: IFileIn, id: number, project: IProject) {
    this.external = input.external ?? false;
    this.id = id;
    if (input.language !== undefined) this._language = input.language;
    this._logicalFilePath = input.logicalFilePath.split(path.sep).join('/');
    if (input.name !== undefined) this._name = input.name;
    this.project = project;
  }

  /**
   * Exports from this file.
   */
  get exports(): ReadonlyArray<ExportModule> {
    return [...this._exports];
  }

  /**
   * Read-only accessor for the file extension.
   */
  get extension(): string | undefined {
    if (this._extension) return this._extension;
    const language = this.language;
    const extension = language ? this.project.extensions[language] : undefined;
    if (extension && extension[0]) return extension[0];
    return;
  }

  /**
   * Read-only accessor for the final emitted path.
   *
   * If undefined, the file has not yet been assigned a final path
   * or is external to the project and should not be emitted.
   */
  get finalPath(): string | undefined {
    if (this._finalPath) return this._finalPath;
    const dirs = this._logicalFilePath
      ? this._logicalFilePath.split('/').slice(0, -1)
      : [];
    return [...dirs, `${this.name}${this.extension ?? ''}`].join('/');
  }

  /**
   * Imports to this file.
   */
  get imports(): ReadonlyArray<ImportModule> {
    return [...this._imports];
  }

  /**
   * Language of the file; inferred from nodes or fallback if not set explicitly.
   */
  get language(): Language | undefined {
    if (this._language) return this._language;
    if (this._nodes[0]) return this._nodes[0].language;
    return;
  }

  /**
   * Logical, extension-free path used for planning and routing.
   */
  get logicalFilePath(): string {
    return this._logicalFilePath;
  }

  /**
   * Base name of the file (without extension).
   *
   * If no name was set explicitly, it is inferred from the logical file path.
   */
  get name(): string {
    if (this._name) return this._name;
    const name = this._logicalFilePath.split('/').pop();
    if (name) return name;
    const message = `File ${this.toString()} has no name`;
    debug(message, 'file');
    throw new Error(message);
  }

  /**
   * Syntax nodes contained in this file.
   */
  get nodes(): ReadonlyArray<INode> {
    return [...this._nodes];
  }

  /**
   * Renderer assigned to this file.
   */
  get renderer(): Renderer | undefined {
    return this._renderer;
  }

  /**
   * Add an export group to the file.
   */
  addExport(group: ExportModule): void {
    this._exports.push(group);
  }

  /**
   * Add an import group to the file.
   */
  addImport(group: ImportModule): void {
    this._imports.push(group);
  }

  /**
   * Add a syntax node to the file.
   */
  addNode(node: INode): void {
    this._nodes.push(node);
    node.file = this;
  }

  /**
   * Sets the file extension.
   */
  setExtension(extension: string): void {
    this._extension = extension;
  }

  /**
   * Sets the final emitted path of the file.
   */
  setFinalPath(path: string): void {
    this._finalPath = path;
  }

  /**
   * Sets the language of the file.
   */
  setLanguage(lang: Language): void {
    this._language = lang;
  }

  /**
   * Sets the name of the file.
   */
  setName(name: string): void {
    this._name = name;
  }

  /**
   * Sets the renderer assigned to this file.
   */
  setRenderer(renderer: Renderer): void {
    this._renderer = renderer;
  }

  /**
   * Returns a debug‑friendly string representation identifying the file.
   */
  toString(): string {
    return `[File ${this._logicalFilePath}#${this.id}]`;
  }
}
