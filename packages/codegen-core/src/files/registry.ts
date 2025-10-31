import { BiMap } from '../bimap/bimap';
import type {
  IFileIdentifier,
  IFileIn,
  IFileOut,
  IFileRegistry,
} from './types';

export class FileRegistry implements IFileRegistry {
  private _id: number = 0;
  private referenceOrder: Set<number> = new Set();
  private registerOrder: Set<number> = new Set();
  private selectorToId: Map<string, number> = new Map();
  private values: Map<number, IFileOut> = new Map();

  get(identifier: IFileIdentifier): IFileOut | undefined {
    const file = this.identifierToFile(identifier);

    if (file.id !== undefined) {
      return this.values.get(file.id);
    }

    const selector =
      file.selector !== undefined ? JSON.stringify(file.selector) : undefined;

    if (selector) {
      const id = this.selectorToId.get(selector);
      if (id !== undefined) {
        return this.values.get(id);
      }
    }

    return;
  }

  get id(): number {
    return this._id++;
  }

  private identifierToFile(
    identifier: IFileIdentifier,
  ): Pick<IFileIn, 'id' | 'selector'> {
    return typeof identifier === 'number'
      ? { id: identifier }
      : { selector: identifier };
  }

  isRegistered(identifier: IFileIdentifier): boolean {
    const file = this.get(identifier);
    return file ? this.registerOrder.has(file.id) : false;
  }

  reference(identifier: IFileIdentifier): IFileOut {
    const file = this.identifierToFile(identifier);
    return this.register(file);
  }

  *referenced(): IterableIterator<IFileOut> {
    for (const id of this.referenceOrder.values()) {
      yield this.values.get(id)!;
    }
  }

  register(file: IFileIn): IFileOut {
    if (file.id !== undefined) {
      const result = this.values.get(file.id);
      if (!result) {
        throw new Error(
          `File with ID ${file.id} not found. To register a new file, leave the ID undefined.`,
        );
      }
      return result;
    }

    const hasOtherKeys = Object.keys(file).some(
      (key) => !['id', 'selector'].includes(key),
    );

    let result: IFileOut | undefined;

    const selector =
      file.selector !== undefined ? JSON.stringify(file.selector) : undefined;
    if (selector) {
      const id = this.selectorToId.get(selector);
      if (id !== undefined) {
        result = this.values.get(id);
        if (!result) {
          throw new Error(
            `File with ID ${id} not found. The selector ${selector} matched an ID, but there was no result. This is likely an issue with the application logic.`,
          );
        }
        if (!hasOtherKeys) {
          return result;
        }
      }
    }

    const id = result?.id !== undefined ? result.id : this.id;
    result = {
      ...result,
      ...file, // clone to avoid mutation
      id,
      resolvedNames: result?.resolvedNames ?? new BiMap(),
      symbols: result?.symbols ?? {
        body: [],
        exports: [],
        imports: [],
      },
    };
    this.values.set(id, result);

    if (hasOtherKeys) {
      this.registerOrder.add(id);
      if (this.referenceOrder.has(id)) {
        this.referenceOrder.delete(id);
      }
    } else {
      this.referenceOrder.add(id);
    }

    if (selector) {
      this.selectorToId.set(selector, id);
    }

    return result;
  }

  *registered(): IterableIterator<IFileOut> {
    for (const id of this.registerOrder.values()) {
      yield this.values.get(id)!;
    }
  }
}
