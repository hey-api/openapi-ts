export class Version<TVersion extends string = string> {
  private readonly _segments: ReadonlyArray<number>;
  readonly raw: TVersion;

  constructor(version: TVersion) {
    this.raw = version;
    this._segments = version.split('.').map((segment) => {
      const num = Number.parseInt(segment, 10);
      if (Number.isNaN(num)) {
        throw new Error(`Invalid version segment "${segment}" in "${version}"`);
      }
      return num;
    });
  }

  private _compare(other: TVersion | Version): number {
    const b = other instanceof Version ? other : new Version(other);
    const len = Math.max(this._segments.length, b._segments.length);
    for (let i = 0; i < len; i++) {
      const a = this._segments[i] ?? 0;
      const bSeg = b._segments[i] ?? 0;
      if (a !== bSeg) return a - bSeg;
    }
    return 0;
  }

  eq(other: TVersion | Version): boolean {
    return this._compare(other) === 0;
  }

  gt(other: TVersion | Version): boolean {
    return this._compare(other) > 0;
  }

  gte(other: TVersion | Version): boolean {
    return this._compare(other) >= 0;
  }

  lt(other: TVersion | Version): boolean {
    return this._compare(other) < 0;
  }

  lte(other: TVersion | Version): boolean {
    return this._compare(other) <= 0;
  }

  toString(): TVersion {
    return this.raw;
  }
}
