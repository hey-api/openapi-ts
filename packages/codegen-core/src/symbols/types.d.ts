import type { ICodegenFile } from '../files/types';

/**
 * Selector array used to select symbols. It doesn't have to be
 * unique, but in practice it might be desirable.
 *
 * @example ["zod", "#/components/schemas/Foo"]
 */
export type ICodegenSymbolSelector = ReadonlyArray<string>;

export interface ICodegenSymbolIn {
  /**
   * Symbols can be **headed** or **headless**.
   *
   * Headless symbols never render their `value`. Headed symbols render their
   * `value` if defined.
   *
   * Symbols are rendered in the order they were registered as headed.
   *
   * Example 1: We register headless symbol `foo`, headed `bar`, and headed
   * `foo`. The render order is [`bar`, `foo`].
   *
   * Example 2: We register headed symbol `foo` and headed `bar`. The render
   * order is [`foo`, `bar`].
   *
   * Headless symbols can be used to claim a symbol or to represent imports
   * or exports.
   *
   * @default false
   */
  headless?: boolean;
  /**
   * The desired name for the symbol within its file. If there are multiple symbols
   * with the same desired name, this might not end up being the actual name.
   *
   * @example "UserModel"
   */
  readonly name: string;
  /**
   * Selector array used to select this symbol. It doesn't have to be
   * unique, but in practice it might be desirable.
   *
   * @example ["zod", "#/components/schemas/Foo"]
   */
  readonly selector?: ICodegenSymbolSelector;
  /**
   * Internal representation of the symbol (e.g. AST node, IR object, raw code).
   * Used to generate output. If left undefined, this symbol becomes `headless`.
   */
  readonly value?: unknown;
}

export interface ICodegenSymbolOut extends ICodegenSymbolIn {
  /**
   * The file this symbol is located in.
   */
  readonly file: ICodegenFile;
  /**
   * Unique symbol ID.
   */
  readonly id: number;
  /**
   * Placeholder name for the symbol to be replaced later with the final value.
   *
   * @example "_heyapi_31_"
   */
  readonly placeholder: string;
  /**
   * Updates this symbol.
   *
   * @param symbol The values to update.
   * @returns The updated symbol.
   */
  readonly update: (symbol: Partial<ICodegenSymbolOut>) => ICodegenSymbolOut;
}

export interface SelectorMethods {
  /**
   * Retrieves symbols matching the selector.
   *
   * @param selector The symbol selector to find.
   * @param file Find symbols only in this file.
   * @returns The array of all symbols matching the selector.
   * @example
   * const symbols = project.selectSymbolAll(["zod", "#/components/schemas/Foo"]);
   */
  selectSymbolAll(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ReadonlyArray<ICodegenSymbolOut>;
  /**
   * Retrieves the first symbol from all symbols matching the selector.
   *
   * @param selector The symbol selector to find.
   * @param file Find symbols only in this file.
   * @returns The symbol if found, or undefined otherwise.
   * @example
   * const symbol = project.selectSymbolFirst(["zod", "#/components/schemas/Foo"]);
   */
  selectSymbolFirst(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ICodegenSymbolOut | undefined;
  /**
   * Retrieves the first symbol from all symbols matching the selector.
   *
   * @param selector The symbol selector to find.
   * @param file Find symbols only in this file.
   * @returns The symbol if found, or throw otherwise.
   * @example
   * const symbol = project.selectSymbolFirstOrThrow(["zod", "#/components/schemas/Foo"]);
   */
  selectSymbolFirstOrThrow(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ICodegenSymbolOut;
  /**
   * Retrieves the last symbol from all symbols matching the selector.
   *
   * @param selector The symbol selector to find.
   * @param file Find symbols only in this file.
   * @returns The symbol if found, or undefined otherwise.
   * @example
   * const symbol = project.selectSymbolLast(["zod", "#/components/schemas/Foo"]);
   */
  selectSymbolLast(
    selector: ICodegenSymbolSelector,
    file?: ICodegenFile,
  ): ICodegenSymbolOut | undefined;
}
