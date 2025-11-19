export class LayoutMixin {
  protected static readonly DEFAULT_THRESHOLD = 3;
  protected layout: boolean | number | undefined;

  /** Sets automatic line output with optional threshold (default: 3). */
  auto(threshold: number = LayoutMixin.DEFAULT_THRESHOLD): this {
    this.layout = threshold;
    return this;
  }

  /** Sets single line output. */
  inline(): this {
    this.layout = false;
    return this;
  }

  /** Sets multi line output. */
  pretty(): this {
    this.layout = true;
    return this;
  }

  /** Computes whether output should be multiline based on layout setting and element count. */
  protected $multiline(count: number): boolean {
    if (this.layout === undefined) {
      this.layout = LayoutMixin.DEFAULT_THRESHOLD;
    }
    return typeof this.layout === 'number' ? count >= this.layout : this.layout;
  }
}
