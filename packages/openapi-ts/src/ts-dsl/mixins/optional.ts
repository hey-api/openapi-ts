export class OptionalMixin {
  protected _optional?: boolean;

  optional<T extends this>(this: T, condition: boolean = true): T {
    this._optional = condition;
    return this;
  }
}
