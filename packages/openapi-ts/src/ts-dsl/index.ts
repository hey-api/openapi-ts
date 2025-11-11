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
import { TypeAttrTsDsl } from './type/attr';
import { TypeExprTsDsl } from './type/expr';
import { TypeLiteralTsDsl } from './type/literal';
import { TypeObjectTsDsl } from './type/object';
import { VarTsDsl } from './var';

const base = {
  /** Creates a property access expression (e.g. `obj.foo`). */
  attr: (...args: ConstructorParameters<typeof AttrTsDsl>) =>
    new AttrTsDsl(...args),

  /** Creates an await expression (e.g. `await promise`). */
  await: (...args: ConstructorParameters<typeof AwaitTsDsl>) =>
    new AwaitTsDsl(...args),

  /** Creates a binary expression (e.g. `a + b`). */
  binary: (...args: ConstructorParameters<typeof BinaryTsDsl>) =>
    new BinaryTsDsl(...args),

  /** Creates a function or method call expression (e.g. `fn(arg)`). */
  call: (...args: ConstructorParameters<typeof CallTsDsl>) =>
    new CallTsDsl(...args),

  /** Creates a class declaration or expression. */
  class: (...args: ConstructorParameters<typeof ClassTsDsl>) =>
    new ClassTsDsl(...args),

  /** Creates a constant variable declaration (`const`). */
  const: (...args: ConstructorParameters<typeof VarTsDsl>) =>
    new VarTsDsl(...args).const(),

  /** Creates a decorator expression (e.g. `@decorator`). */
  decorator: (...args: ConstructorParameters<typeof DecoratorTsDsl>) =>
    new DecoratorTsDsl(...args),

  /** Creates a describe block (used for tests or descriptions). */
  describe: (...args: ConstructorParameters<typeof DescribeTsDsl>) =>
    new DescribeTsDsl(...args),

  /** Creates a general expression node. */
  expr: (...args: ConstructorParameters<typeof ExprTsDsl>) =>
    new ExprTsDsl(...args),

  /** Creates a field declaration in a class or object. */
  field: (...args: ConstructorParameters<typeof FieldTsDsl>) =>
    new FieldTsDsl(...args),

  /** Creates a function expression or declaration. */
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

  /** Creates a getter method declaration. */
  getter: (...args: ConstructorParameters<typeof GetterTsDsl>) =>
    new GetterTsDsl(...args),

  /** Creates an if statement. */
  if: (...args: ConstructorParameters<typeof IfTsDsl>) => new IfTsDsl(...args),

  /** Creates an initialization block or statement. */
  init: (...args: ConstructorParameters<typeof InitTsDsl>) =>
    new InitTsDsl(...args),

  /** Creates a let variable declaration (`let`). */
  let: (...args: ConstructorParameters<typeof VarTsDsl>) =>
    new VarTsDsl(...args).let(),

  /** Creates a literal value (e.g. string, number, boolean). */
  literal: (...args: ConstructorParameters<typeof LiteralTsDsl>) =>
    new LiteralTsDsl(...args),

  /** Creates a method declaration inside a class or object. */
  method: (...args: ConstructorParameters<typeof MethodTsDsl>) =>
    new MethodTsDsl(...args),

  /** Creates a new expression (e.g. `new ClassName()`). */
  new: (...args: ConstructorParameters<typeof NewTsDsl>) =>
    new NewTsDsl(...args),

  /** Creates a newline (for formatting purposes). */
  newline: (...args: ConstructorParameters<typeof NewlineTsDsl>) =>
    new NewlineTsDsl(...args),

  /** Creates a logical NOT expression (e.g. `!expr`). */
  not: (...args: ConstructorParameters<typeof NotTsDsl>) =>
    new NotTsDsl(...args),

  /** Creates an object literal expression. */
  object: (...args: ConstructorParameters<typeof ObjectTsDsl>) =>
    new ObjectTsDsl(...args),

  /** Creates a parameter declaration for functions or methods. */
  param: (...args: ConstructorParameters<typeof ParamTsDsl>) =>
    new ParamTsDsl(...args),

  /** Creates a pattern for destructuring or matching. */
  pattern: (...args: ConstructorParameters<typeof PatternTsDsl>) =>
    new PatternTsDsl(...args),

  /** Creates a return statement. */
  return: (...args: ConstructorParameters<typeof ReturnTsDsl>) =>
    new ReturnTsDsl(...args),

  /** Creates a setter method declaration. */
  setter: (...args: ConstructorParameters<typeof SetterTsDsl>) =>
    new SetterTsDsl(...args),

  /** Creates a template literal expression. */
  template: (...args: ConstructorParameters<typeof TemplateTsDsl>) =>
    new TemplateTsDsl(...args),

  /** Creates a throw statement. */
  throw: (...args: ConstructorParameters<typeof ThrowTsDsl>) =>
    new ThrowTsDsl(...args),

  /** Creates a basic type reference or type expression (e.g. Foo or Foo<T>). */
  type: Object.assign(
    (...args: ConstructorParameters<typeof TypeExprTsDsl>) =>
      new TypeExprTsDsl(...args),
    {
      /** Creates a qualified type reference (e.g. Foo.Bar). */
      attr: (...args: ConstructorParameters<typeof TypeAttrTsDsl>) =>
        new TypeAttrTsDsl(...args),

      /** Creates a basic type reference or type expression (e.g. Foo or Foo<T>). */
      expr: (...args: ConstructorParameters<typeof TypeExprTsDsl>) =>
        new TypeExprTsDsl(...args),

      /** Creates a literal type node (e.g. 'foo', 42, or true). */
      literal: (...args: ConstructorParameters<typeof TypeLiteralTsDsl>) =>
        new TypeLiteralTsDsl(...args),

      /** Creates a type literal node (e.g. { foo: string }). */
      object: (...args: ConstructorParameters<typeof TypeObjectTsDsl>) =>
        new TypeObjectTsDsl(...args),
    },
  ),

  /** Creates a variable declaration (var). */
  var: (...args: ConstructorParameters<typeof VarTsDsl>) =>
    new VarTsDsl(...args),
};

/** Creates a general expression node. */
export const $ = Object.assign(
  (...args: ConstructorParameters<typeof ExprTsDsl>) => new ExprTsDsl(...args),
  base,
);

export { TsDsl } from './base';
