import { keywords } from './keywords';

type List = ReadonlyArray<string>;

export class ReservedList {
  private _array: List;
  private _set: Set<string>;

  constructor(values: List) {
    this._array = values;
    this._set = new Set(values);
  }

  get '~values'() {
    return this._set;
  }

  /**
   * Updates the reserved list with new values.
   *
   * @param values New reserved values or a function that receives the previous
   * reserved values and returns the new ones.
   */
  set(values: List | ((prev: List) => List)): void {
    const vals = typeof values === 'function' ? values(this._array) : values;
    this._array = vals;
    this._set = new Set(vals);
  }
}

const runtimeReserved = new ReservedList([
  ...keywords.browserGlobals,
  ...keywords.javaScriptGlobals,
  ...keywords.javaScriptKeywords,
  ...keywords.nodeGlobals,
  ...keywords.typeScriptKeywords,
]);

const typeReserved = new ReservedList([
  ...keywords.javaScriptKeywords,
  ...keywords.typeScriptKeywords,
]);

/**
 * Reserved names for identifiers. These names will not be used
 * for variables, functions, classes, or other identifiers in generated code.
 */
export const reserved = {
  /**
   * Reserved names for runtime identifiers. These names will not be used
   * for variables, functions, classes, or other runtime identifiers in
   * generated code.
   */
  runtime: runtimeReserved,
  /**
   * Reserved names for type identifiers. These names will not be used
   * for type or interface identifiers in generated code.
   */
  type: typeReserved,
};
