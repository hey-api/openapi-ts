import { wrapId } from '../renderer/utils';
import type { ISelector } from '../selectors/types';
import type { ISymbolIn, ISymbolOut, ISymbolRegistry } from './types';

export class SymbolRegistry implements ISymbolRegistry {
  private _id: number = 0;
  private nodes: Map<number, unknown> = new Map();
  private registerOrder: Set<number> = new Set();
  private selectorToId: Map<string, number> = new Map();
  private values: Map<number, ISymbolOut> = new Map();

  get(symbolIdOrSelector: number | ISelector): ISymbolOut | undefined {
    const symbol = this.idOrSelector(symbolIdOrSelector);

    if (symbol.id !== undefined) {
      return this.values.get(symbol.id);
    }

    const selector =
      symbol.selector !== undefined
        ? JSON.stringify(symbol.selector)
        : undefined;

    if (selector) {
      const id = this.selectorToId.get(selector);
      if (id !== undefined) {
        return this.values.get(id);
      }
    }

    return;
  }

  getValue(symbolId: number): unknown {
    return this.nodes.get(symbolId);
  }

  hasValue(symbolId: number): boolean {
    return this.nodes.has(symbolId);
  }

  get id(): number {
    return this._id++;
  }

  private idOrSelector(
    symbolIdOrSelector: number | ISelector,
  ): Pick<ISymbolIn, 'id' | 'selector'> {
    return typeof symbolIdOrSelector === 'number'
      ? { id: symbolIdOrSelector }
      : { selector: symbolIdOrSelector };
  }

  reference(symbolIdOrSelector: number | ISelector): ISymbolOut {
    const symbol = this.idOrSelector(symbolIdOrSelector);
    return this.register(symbol);
  }

  register(symbol: ISymbolIn): ISymbolOut {
    if (symbol.id !== undefined) {
      const result = this.values.get(symbol.id);
      if (!result) {
        throw new Error(
          `Symbol with ID ${symbol.id} not found. To register a new symbol, leave the ID undefined.`,
        );
      }
      return result;
    }

    const hasOtherKeys = Object.keys(symbol).some(
      (key) => !['id', 'selector'].includes(key),
    );

    let result: ISymbolOut | undefined;

    const selector =
      symbol.selector !== undefined
        ? JSON.stringify(symbol.selector)
        : undefined;
    if (selector) {
      const id = this.selectorToId.get(selector);
      if (id !== undefined) {
        result = this.values.get(id);
        if (!result) {
          throw new Error(
            `Symbol with ID ${id} not found. The selector ${selector} matched an ID, but there was no result. This is likely an issue with the application logic.`,
          );
        }
        if (!hasOtherKeys) {
          return result;
        }
      }
    }

    const id = result?.id !== undefined ? result.id : this.id;
    const exportFrom: Array<string> = result?.exportFrom
      ? [...result.exportFrom]
      : [];
    if (symbol.exportFrom) {
      exportFrom.push(...symbol.exportFrom);
    }
    result = {
      ...result,
      ...symbol, // clone to avoid mutation
      exportFrom,
      id,
      placeholder:
        result?.placeholder ?? symbol.placeholder ?? wrapId(String(id)),
    };
    this.values.set(id, result);

    if (hasOtherKeys) {
      this.registerOrder.add(id);
    }

    if (selector) {
      this.selectorToId.set(selector, id);
    }

    return result;
  }

  *registered(): IterableIterator<ISymbolOut> {
    for (const id of this.registerOrder.values()) {
      yield this.values.get(id)!;
    }
  }

  setValue(symbolId: number, value: unknown): Map<number, unknown> {
    return this.nodes.set(symbolId, value);
  }
}
