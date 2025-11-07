import { AttrTsDsl } from './attr';
import { AwaitTsDsl } from './await';
import { BinaryTsDsl } from './binary';
import { CallTsDsl } from './call';
import { ClassTsDsl } from './class';
import { DecoratorTsDsl } from './decorator';
import { DescribeTsDsl } from './describe';
import { ExprTsDsl } from './expr';
import { FieldTsDsl } from './field';
import { FuncTsDsl } from './func';
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
import { PatternTsDsl } from './pattern';
import { ReturnTsDsl } from './return';
import { SetterTsDsl } from './setter';
import { TemplateTsDsl } from './template';
import { ThrowTsDsl } from './throw';
import { TypeTsDsl } from './type';
import { VarTsDsl } from './var';

const base = {
  attr: (...args: ConstructorParameters<typeof AttrTsDsl>) =>
    new AttrTsDsl(...args),
  await: (...args: ConstructorParameters<typeof AwaitTsDsl>) =>
    new AwaitTsDsl(...args),
  binary: (...args: ConstructorParameters<typeof BinaryTsDsl>) =>
    new BinaryTsDsl(...args),
  call: (...args: ConstructorParameters<typeof CallTsDsl>) =>
    new CallTsDsl(...args),
  class: (...args: ConstructorParameters<typeof ClassTsDsl>) =>
    new ClassTsDsl(...args),
  const: (...args: ConstructorParameters<typeof VarTsDsl>) =>
    new VarTsDsl(...args).const(),
  decorator: (...args: ConstructorParameters<typeof DecoratorTsDsl>) =>
    new DecoratorTsDsl(...args),
  describe: (...args: ConstructorParameters<typeof DescribeTsDsl>) =>
    new DescribeTsDsl(...args),
  expr: (...args: ConstructorParameters<typeof ExprTsDsl>) =>
    new ExprTsDsl(...args),
  field: (...args: ConstructorParameters<typeof FieldTsDsl>) =>
    new FieldTsDsl(...args),
  func: ((nameOrFn?: any, fn?: any) => {
    if (nameOrFn === undefined) return new FuncTsDsl();
    if (typeof nameOrFn !== 'string') return new FuncTsDsl(nameOrFn);
    if (fn === undefined) return new FuncTsDsl(nameOrFn);
    return new FuncTsDsl(nameOrFn, fn);
  }) as {
    (): FuncTsDsl<'arrow'>;
    (fn: (f: FuncTsDsl<'arrow'>) => void): FuncTsDsl<'arrow'>;
    (name: string): FuncTsDsl<'decl'>;
    (name: string, fn: (f: FuncTsDsl<'decl'>) => void): FuncTsDsl<'decl'>;
  },
  getter: (...args: ConstructorParameters<typeof GetterTsDsl>) =>
    new GetterTsDsl(...args),
  if: (...args: ConstructorParameters<typeof IfTsDsl>) => new IfTsDsl(...args),
  init: (...args: ConstructorParameters<typeof InitTsDsl>) =>
    new InitTsDsl(...args),
  let: (...args: ConstructorParameters<typeof VarTsDsl>) =>
    new VarTsDsl(...args).let(),
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
  pattern: (...args: ConstructorParameters<typeof PatternTsDsl>) =>
    new PatternTsDsl(...args),
  return: (...args: ConstructorParameters<typeof ReturnTsDsl>) =>
    new ReturnTsDsl(...args),
  setter: (...args: ConstructorParameters<typeof SetterTsDsl>) =>
    new SetterTsDsl(...args),
  template: (...args: ConstructorParameters<typeof TemplateTsDsl>) =>
    new TemplateTsDsl(...args),
  throw: (...args: ConstructorParameters<typeof ThrowTsDsl>) =>
    new ThrowTsDsl(...args),
  type: TypeTsDsl,
  var: (...args: ConstructorParameters<typeof VarTsDsl>) =>
    new VarTsDsl(...args),
};

export const $ = Object.assign(
  (...args: ConstructorParameters<typeof ExprTsDsl>) => new ExprTsDsl(...args),
  base,
);

export { TsDsl } from './base';
