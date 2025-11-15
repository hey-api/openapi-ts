import { ArrayTsDsl } from './array';
import { AsTsDsl } from './as';
import { AttrTsDsl } from './attr';
import { AwaitTsDsl } from './await';
import { BinaryTsDsl } from './binary';
import { CallTsDsl } from './call';
import { ClassTsDsl } from './class';
import { DecoratorTsDsl } from './decorator';
import { DocTsDsl } from './doc';
import { ExprTsDsl } from './expr';
import { FieldTsDsl } from './field';
import { FuncTsDsl } from './func';
import { GetterTsDsl } from './getter';
import { HintTsDsl } from './hint';
import { IfTsDsl } from './if';
import { InitTsDsl } from './init';
import { LiteralTsDsl } from './literal';
import { MethodTsDsl } from './method';
import { NewTsDsl } from './new';
import { NewlineTsDsl } from './newline';
import { NotTsDsl } from './not';
import { NoteTsDsl } from './note';
import { ObjectTsDsl } from './object';
import { ParamTsDsl } from './param';
import { PatternTsDsl } from './pattern';
import { RegExpTsDsl } from './regexp';
import { ReturnTsDsl } from './return';
import { SetterTsDsl } from './setter';
import { TemplateTsDsl } from './template';
import { TernaryTsDsl } from './ternary';
import { ThrowTsDsl } from './throw';
import { TypeAliasTsDsl } from './type/alias';
import { TypeAttrTsDsl } from './type/attr';
import { TypeExprTsDsl } from './type/expr';
import { TypeLiteralTsDsl } from './type/literal';
import { TypeObjectTsDsl } from './type/object';
import { TypeOfExprTsDsl } from './typeof';
import { VarTsDsl } from './var';

const base = {
  /** Creates an array literal expression (e.g. `[1, 2, 3]`). */
  array: (...args: ConstructorParameters<typeof ArrayTsDsl>) =>
    new ArrayTsDsl(...args),

  /** Creates an `as` type assertion expression (e.g. `value as Type`). */
  as: (...args: ConstructorParameters<typeof AsTsDsl>) => new AsTsDsl(...args),

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

  /** Creates a JSDoc documentation block. */
  doc: (...args: ConstructorParameters<typeof DocTsDsl>) =>
    new DocTsDsl(...args),

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

  /** Creates a single-line comment (//). */
  hint: (...args: ConstructorParameters<typeof HintTsDsl>) =>
    new HintTsDsl(...args),

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

  /** Creates a block comment (/* ... *\/). */
  note: (...args: ConstructorParameters<typeof NoteTsDsl>) =>
    new NoteTsDsl(...args),

  /** Creates an object literal expression. */
  object: (...args: ConstructorParameters<typeof ObjectTsDsl>) =>
    new ObjectTsDsl(...args),

  /** Creates a parameter declaration for functions or methods. */
  param: (...args: ConstructorParameters<typeof ParamTsDsl>) =>
    new ParamTsDsl(...args),

  /** Creates a pattern for destructuring or matching. */
  pattern: (...args: ConstructorParameters<typeof PatternTsDsl>) =>
    new PatternTsDsl(...args),

  /** Creates a regular expression literal (e.g. `/foo/gi`). */
  regexp: (...args: ConstructorParameters<typeof RegExpTsDsl>) =>
    new RegExpTsDsl(...args),

  /** Creates a return statement. */
  return: (...args: ConstructorParameters<typeof ReturnTsDsl>) =>
    new ReturnTsDsl(...args),

  /** Creates a setter method declaration. */
  setter: (...args: ConstructorParameters<typeof SetterTsDsl>) =>
    new SetterTsDsl(...args),

  /** Creates a template literal expression. */
  template: (...args: ConstructorParameters<typeof TemplateTsDsl>) =>
    new TemplateTsDsl(...args),

  /** Creates a ternary conditional expression (if ? then : else). */
  ternary: (...args: ConstructorParameters<typeof TernaryTsDsl>) =>
    new TernaryTsDsl(...args),

  /** Creates a throw statement. */
  throw: (...args: ConstructorParameters<typeof ThrowTsDsl>) =>
    new ThrowTsDsl(...args),

  /** Creates a basic type reference or type expression (e.g. Foo or Foo<T>). */
  type: Object.assign(
    (...args: ConstructorParameters<typeof TypeExprTsDsl>) =>
      new TypeExprTsDsl(...args),
    {
      /** Creates a type alias declaration (e.g. `type Foo = Bar`). */
      alias: (...args: ConstructorParameters<typeof TypeAliasTsDsl>) =>
        new TypeAliasTsDsl(...args),

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

  /** Creates a runtime `typeof` expression (e.g. typeof x). */
  typeofExpr: (...args: ConstructorParameters<typeof TypeOfExprTsDsl>) =>
    new TypeOfExprTsDsl(...args),

  /** Creates a variable declaration (var). */
  var: (...args: ConstructorParameters<typeof VarTsDsl>) =>
    new VarTsDsl(...args),
};

export const $ = Object.assign(
  (...args: ConstructorParameters<typeof ExprTsDsl>) => new ExprTsDsl(...args),
  base,
);
export type DollarTsDsl = {
  /**
   * Entry point to the TypeScript DSL.
   *
   * `$` creates a general expression node by default, but also exposes
   * builders for all other constructs such as `.type()`, `.call()`,
   * `.object()`, `.func()`, etc.
   *
   * Example:
   * ```ts
   * const node = $('console').attr('log').call($.literal('Hello'));
   * ```
   *
   * Returns:
   * - A new `ExprTsDsl` instance when called directly.
   * - The `base` factory object for constructing more specific nodes.
   */
  $: typeof $;
};

export { ArrayTsDsl } from './array';
export { AsTsDsl } from './as';
export { AttrTsDsl } from './attr';
export { AwaitTsDsl } from './await';
export { TsDsl } from './base';
export { BinaryTsDsl } from './binary';
export { CallTsDsl } from './call';
export { ClassTsDsl } from './class';
export { DecoratorTsDsl } from './decorator';
export { DocTsDsl } from './doc';
export { ExprTsDsl } from './expr';
export { FieldTsDsl } from './field';
export { FuncTsDsl } from './func';
export { GetterTsDsl } from './getter';
export { HintTsDsl } from './hint';
export { IfTsDsl } from './if';
export { InitTsDsl } from './init';
export { LiteralTsDsl } from './literal';
export { MethodTsDsl } from './method';
export { NewTsDsl } from './new';
export { NewlineTsDsl } from './newline';
export { NotTsDsl } from './not';
export { NoteTsDsl } from './note';
export { ObjectTsDsl } from './object';
export { ParamTsDsl } from './param';
export { PatternTsDsl } from './pattern';
export { RegExpTsDsl } from './regexp';
export { ReturnTsDsl } from './return';
export { SetterTsDsl } from './setter';
export { TemplateTsDsl } from './template';
export { ThrowTsDsl } from './throw';
export { TypeAliasTsDsl } from './type/alias';
export { TypeAttrTsDsl } from './type/attr';
export { TypeExprTsDsl } from './type/expr';
export { TypeLiteralTsDsl } from './type/literal';
export { TypeObjectTsDsl } from './type/object';
export { VarTsDsl } from './var';
