import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import { PyDsl } from '../base';

type ImportName = { alias?: string; name: string };

const Mixed = PyDsl<py.ImportStatement>;

export class ImportPyDsl extends Mixed {
  readonly '~dsl' = 'ImportPyDsl';

  protected isFrom: boolean = true;
  protected module: string = '';
  protected names?: ReadonlyArray<ImportName>;

  constructor(module: string);
  constructor(module: string, isFrom: boolean);
  constructor(module: string, names: ReadonlyArray<ImportName>, isFrom: boolean);
  constructor(
    module: string,
    namesOrIsFrom?: ReadonlyArray<ImportName> | boolean,
    isFrom?: boolean,
  ) {
    super();
    this.module = module;
    if (typeof namesOrIsFrom === 'boolean') {
      this.isFrom = namesOrIsFrom;
    } else if (Array.isArray(namesOrIsFrom)) {
      this.names = namesOrIsFrom;
      this.isFrom = isFrom ?? true;
    } else {
      this.isFrom = true;
    }
  }

  static from(module: string, names?: ReadonlyArray<ImportName>): ImportPyDsl {
    return names ? new ImportPyDsl(module, names, true) : new ImportPyDsl(module, true);
  }

  static direct(module: string): ImportPyDsl {
    return new ImportPyDsl(module, false);
  }

  override analyze(_ctx: AnalysisContext): void {
    super.analyze(_ctx);
  }

  override toAst(): py.ImportStatement {
    return {
      isFrom: this.isFrom,
      kind: py.PyNodeKind.ImportStatement,
      module: this.module,
      names: this.names,
    };
  }
}
