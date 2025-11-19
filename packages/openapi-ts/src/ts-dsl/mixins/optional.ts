export class OptionalMixin {
  protected _optional?: boolean;

  /** Marks the node as optional when the condition is true. */
  optional<T extends this>(this: T, condition?: boolean): T {
    this._optional = arguments.length === 0 ? true : Boolean(condition);
    return this;
  }

  /** Marks the node as required when the condition is true. */
  required<T extends this>(this: T, condition?: boolean): T {
    this._optional = arguments.length === 0 ? false : !condition;
    return this;
  }
}
