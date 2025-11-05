/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import ts from 'typescript';

import { TsDsl } from './base';
import { mixin } from './mixins/apply';
import { DescribeMixin } from './mixins/describe';
import {
  createModifierAccessor,
  DefaultMixin,
  ExportMixin,
} from './mixins/modifiers';
import { ValueMixin } from './mixins/value';

export class ConstTsDsl extends TsDsl<ts.VariableStatement> {
  private modifiers = createModifierAccessor(this);
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  $render(): ts.VariableStatement {
    return ts.factory.createVariableStatement(
      this.modifiers.list(),
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(this.name),
            undefined,
            undefined,
            this.$node(this.initializer),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );
  }
}

export interface ConstTsDsl
  extends DefaultMixin,
    DescribeMixin,
    ExportMixin,
    ValueMixin {}
mixin(
  ConstTsDsl,
  DefaultMixin,
  [DescribeMixin, { overrideRender: true }],
  ExportMixin,
  ValueMixin,
);
