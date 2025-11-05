import { AttrTsDsl } from './attr';
import { BinaryTsDsl } from './binary';
import { CallTsDsl } from './call';
import { ClassTsDsl } from './class';
import { ConstTsDsl } from './const';
import { DescribeTsDsl } from './describe';
import { ExprTsDsl } from './expr';
import { FieldTsDsl } from './field';
import { GetterTsDsl } from './getter';
import { IfTsDsl } from './if';
import { InitTsDsl } from './init';
import { LiteralTsDsl } from './literal';
import { MethodTsDsl } from './method';
import { NewTsDsl } from './new';
import { NewlineTsDsl } from './newline';
import { NotTsDsl } from './not';
import { ObjectTsDsl } from './object';
import { ParamTsDsl } from './param';
import { ReturnTsDsl } from './return';
import { SetterTsDsl } from './setter';
import { TemplateTsDsl } from './template';
import { ThrowTsDsl } from './throw';
import { TypeTsDsl } from './type';

const base = {
  attr: (...args: ConstructorParameters<typeof AttrTsDsl>) =>
    new AttrTsDsl(...args),
  binary: (...args: ConstructorParameters<typeof BinaryTsDsl>) =>
    new BinaryTsDsl(...args),
  call: (...args: ConstructorParameters<typeof CallTsDsl>) =>
    new CallTsDsl(...args),
  class: (...args: ConstructorParameters<typeof ClassTsDsl>) =>
    new ClassTsDsl(...args),
  const: (...args: ConstructorParameters<typeof ConstTsDsl>) =>
    new ConstTsDsl(...args),
  describe: (...args: ConstructorParameters<typeof DescribeTsDsl>) =>
    new DescribeTsDsl(...args),
  expr: (...args: ConstructorParameters<typeof ExprTsDsl>) =>
    new ExprTsDsl(...args),
  field: (...args: ConstructorParameters<typeof FieldTsDsl>) =>
    new FieldTsDsl(...args),
  getter: (...args: ConstructorParameters<typeof GetterTsDsl>) =>
    new GetterTsDsl(...args),
  if: (...args: ConstructorParameters<typeof IfTsDsl>) => new IfTsDsl(...args),
  init: (...args: ConstructorParameters<typeof InitTsDsl>) =>
    new InitTsDsl(...args),
  literal: (...args: ConstructorParameters<typeof LiteralTsDsl>) =>
    new LiteralTsDsl(...args),
  method: (...args: ConstructorParameters<typeof MethodTsDsl>) =>
    new MethodTsDsl(...args),
  new: (...args: ConstructorParameters<typeof NewTsDsl>) =>
    new NewTsDsl(...args),
  newline: (...args: ConstructorParameters<typeof NewlineTsDsl>) =>
    new NewlineTsDsl(...args),
  not: (...args: ConstructorParameters<typeof NotTsDsl>) =>
    new NotTsDsl(...args),
  object: (...args: ConstructorParameters<typeof ObjectTsDsl>) =>
    new ObjectTsDsl(...args),
  param: (...args: ConstructorParameters<typeof ParamTsDsl>) =>
    new ParamTsDsl(...args),
  return: (...args: ConstructorParameters<typeof ReturnTsDsl>) =>
    new ReturnTsDsl(...args),
  setter: (...args: ConstructorParameters<typeof SetterTsDsl>) =>
    new SetterTsDsl(...args),
  template: (...args: ConstructorParameters<typeof TemplateTsDsl>) =>
    new TemplateTsDsl(...args),
  throw: (...args: ConstructorParameters<typeof ThrowTsDsl>) =>
    new ThrowTsDsl(...args),
  type: TypeTsDsl,
};

export const $ = Object.assign(
  (...args: ConstructorParameters<typeof ExprTsDsl>) => new ExprTsDsl(...args),
  base,
);

export type { TsDsl } from './base';
