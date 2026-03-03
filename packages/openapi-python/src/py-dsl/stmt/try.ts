import type { AnalysisContext, NodeName } from '@hey-api/codegen-core';
import type { MaybeArray } from '@hey-api/types';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
import type { DoExpr } from '../mixins/do';
import { BlockPyDsl } from './block';

const Mixed = PyDsl<py.TryStatement>;

type ExceptType = string | MaybePyDsl<py.Expression>;

interface ExceptEntry {
  body: Array<DoExpr>;
  name?: NodeName;
  types: Array<ExceptType>;
}

function exceptKey(types: Array<ExceptType>): string {
  return types
    .map((t) => (typeof t === 'string' ? t : '<<expr>>'))
    .sort()
    .join(',');
}

export class TryPyDsl extends Mixed {
  readonly '~dsl' = 'TryPyDsl';

  /**
   * Ordered list of except clauses.  We also keep a lookup map
   * (`_exceptIndex`) keyed by the normalised type key so that
   * repeated `.except()` calls with the same type set merge their
   * body statements instead of creating duplicate clauses.
   */
  protected _excepts: Array<ExceptEntry> = [];
  protected _exceptIndex: Map<string, number> = new Map();

  protected _finally?: Array<DoExpr>;
  protected _try?: Array<DoExpr>;

  constructor(...tryBlock: Array<DoExpr>) {
    super();
    this.try(...tryBlock);
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);

    if (this._try) {
      ctx.pushScope();
      try {
        for (const stmt of this._try) ctx.analyze(stmt);
      } finally {
        ctx.popScope();
      }
    }

    for (const entry of this._excepts) {
      ctx.pushScope();
      try {
        ctx.analyze(entry.name);
        for (const t of entry.types) ctx.analyze(t);
        for (const stmt of entry.body) ctx.analyze(stmt);
      } finally {
        ctx.popScope();
      }
    }

    if (this._finally) {
      ctx.pushScope();
      try {
        for (const stmt of this._finally) ctx.analyze(stmt);
      } finally {
        ctx.popScope();
      }
    }
  }

  /** Returns true when all required builder calls are present. */
  get isValid(): boolean {
    return this.missingRequiredCalls().length === 0;
  }

  /**
   * Add (or merge into) an except clause.
   *
   * ```ts
   * $.try(...)
   *   .except('ValueError', 'e', body1, body2)     // except ValueError as e:
   *   .except(['TypeError', 'KeyError'], 'e', ...) // except (TypeError, KeyError) as e:
   *   .except('ValueError', moreBody)              // merges into first clause
   * ```
   *
   * @param types  Single exception type or array of types.
   * @param nameOrBody  Either the `as` variable name (`NodeName`) or the
   *   first body expression. If it looks like a `NodeName` (string that
   *   is a valid Python identifier and is *not* a DSL node), it is treated
   *   as the name; pass body items after it.
   * @param body   Remaining body statements.
   */
  except(
    types: MaybeArray<ExceptType>,
    nameOrBody?: NodeName | DoExpr,
    ...body: Array<DoExpr>
  ): this {
    const typeArr = Array.isArray(types) ? types : [types];
    const key = exceptKey(typeArr);

    let name: NodeName | undefined;
    let bodyItems: Array<DoExpr>;

    // Disambiguate: if the second arg is a plain string that looks like
    // an identifier (no dots, no spaces, not a DSL node) treat it as
    // the `as` name.  Otherwise it's the first body expression.
    if (nameOrBody !== undefined && this._isNodeName(nameOrBody)) {
      name = nameOrBody as NodeName;
      bodyItems = body;
    } else if (nameOrBody !== undefined) {
      bodyItems = [nameOrBody as DoExpr, ...body];
    } else {
      bodyItems = body;
    }

    const existing = this._exceptIndex.get(key);
    if (existing !== undefined) {
      const entry = this._excepts[existing]!;
      entry.body.push(...bodyItems);
      if (name !== undefined) entry.name = name;
    } else {
      this._exceptIndex.set(key, this._excepts.length);
      this._excepts.push({ body: bodyItems, name, types: typeArr });
    }

    return this;
  }

  /** Add a bare `except:` clause (catches everything). */
  exceptAll(...body: Array<DoExpr>): this {
    const key = '';
    const existing = this._exceptIndex.get(key);
    if (existing !== undefined) {
      this._excepts[existing]!.body.push(...body);
    } else {
      this._exceptIndex.set(key, this._excepts.length);
      this._excepts.push({ body, types: [] });
    }
    return this;
  }

  finally(...items: Array<DoExpr>): this {
    this._finally = items;
    return this;
  }

  try(...items: Array<DoExpr>): this {
    this._try = items;
    return this;
  }

  override toAst() {
    this.$validate();

    const tryStatements = new BlockPyDsl(...this._try!).$do();

    let exceptClauses: Array<py.ExceptClause> | undefined;
    if (this._excepts.length) {
      exceptClauses = this._excepts.map((entry) => {
        const bodyStatements = new BlockPyDsl(...entry.body).$do();

        let exceptionType: py.Expression | undefined;
        if (entry.types.length === 1) {
          exceptionType = this.$node(entry.types[0]!);
        } else if (entry.types.length > 1) {
          exceptionType = py.factory.createTupleExpression(entry.types.map((t) => this.$node(t)));
        }

        const exceptionName = entry.name
          ? py.factory.createIdentifier(
              this.$name({ current: entry.name } as any) || String(entry.name),
            )
          : undefined;

        return py.factory.createExceptClause([...bodyStatements], exceptionType, exceptionName);
      });
    }

    const finallyStatements = this._finally
      ? [...new BlockPyDsl(...this._finally).$do()]
      : undefined;

    return py.factory.createTryStatement(
      [...tryStatements],
      exceptClauses,
      undefined,
      finallyStatements,
    );
  }

  $validate(): asserts this is this & {
    _try: Array<DoExpr>;
  } {
    const missing = this.missingRequiredCalls();
    if (missing.length === 0) return;
    throw new Error(`Try statement missing ${missing.join(' and ')}`);
  }

  private missingRequiredCalls(): ReadonlyArray<string> {
    const missing: Array<string> = [];
    if (!this._try || this._try.length === 0) missing.push('.try()');
    return missing;
  }

  /**
   * Heuristic: a value is a `NodeName` (intended as the `as` variable)
   * if it is a plain string matching a Python identifier pattern, or a
   * Symbol.
   */
  private _isNodeName(value: unknown): boolean {
    if (typeof value === 'string') {
      return /^[A-Za-z_]\w*$/.test(value);
    }
    // Symbols from codegen-core have `~brand`
    if (value && typeof value === 'object' && '~brand' in value) {
      return true;
    }
    return false;
  }
}
