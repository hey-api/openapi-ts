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
import { NoteTsDsl } from './note';
import { ObjectTsDsl } from './object';
import { ParamTsDsl } from './param';
import { PatternTsDsl } from './pattern';
import { PrefixTsDsl } from './prefix';
import { RegExpTsDsl } from './regexp';
import { ReturnTsDsl } from './return';
import { SetterTsDsl } from './setter';
import { TemplateTsDsl } from './template';
import { TernaryTsDsl } from './ternary';
import { ThrowTsDsl } from './throw';
import { toExpr } from './toExpr';
import { toStmt } from './toStmt';
import { TypeAliasTsDsl } from './type/alias';
import { TypeAndTsDsl } from './type/and';
import { TypeAttrTsDsl } from './type/attr';
import { TypeExprTsDsl } from './type/expr';
import { TypeFuncTsDsl } from './type/func';
import { TypeIdxTsDsl } from './type/idx';
import { TypeLiteralTsDsl } from './type/literal';
import { TypeObjectTsDsl } from './type/object';
import { TypeOrTsDsl } from './type/or';
import { TypeParamTsDsl } from './type/param';
import { TypeQueryTsDsl } from './type/query';
import { TypeTupleTsDsl } from './type/tuple';
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
    (
      name?: string,
      fn?: (f: FuncTsDsl<'decl'>) => void,
    ): FuncTsDsl<'arrow'> | FuncTsDsl<'decl'>;
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

  /** Creates a negation expression (`-x`). */
  neg: (...args: ConstructorParameters<typeof PrefixTsDsl>) =>
    new PrefixTsDsl(...args).neg(),

  /** Creates a new expression (e.g. `new ClassName()`). */
  new: (...args: ConstructorParameters<typeof NewTsDsl>) =>
    new NewTsDsl(...args),

  /** Creates a newline (for formatting purposes). */
  newline: (...args: ConstructorParameters<typeof NewlineTsDsl>) =>
    new NewlineTsDsl(...args),

  /** Creates a logical NOT expression (`!x`). */
  not: (...args: ConstructorParameters<typeof PrefixTsDsl>) =>
    new PrefixTsDsl(...args).not(),

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

  /** Creates a prefix unary expression (e.g. `-x`, `!x`, `~x`). */
  prefix: (...args: ConstructorParameters<typeof PrefixTsDsl>) =>
    new PrefixTsDsl(...args),

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

  /** Converts a runtime value into a corresponding expression node. */
  toExpr: (...args: Parameters<typeof toExpr>) => toExpr(...args),

  /** Converts a runtime value into a corresponding statement node. */
  toStmt: (...args: Parameters<typeof toStmt>) => toStmt(...args),

  /** Creates a basic type reference or type expression (e.g. Foo or Foo<T>). */
  type: Object.assign(
    (...args: ConstructorParameters<typeof TypeExprTsDsl>) =>
      new TypeExprTsDsl(...args),
    {
      /** Creates a type alias declaration (e.g. `type Foo = Bar`). */
      alias: (...args: ConstructorParameters<typeof TypeAliasTsDsl>) =>
        new TypeAliasTsDsl(...args),

      /** Creates an intersection type (e.g. `A & B`). */
      and: (...args: ConstructorParameters<typeof TypeAndTsDsl>) =>
        new TypeAndTsDsl(...args),

      /** Creates a qualified type reference (e.g. Foo.Bar). */
      attr: (...args: ConstructorParameters<typeof TypeAttrTsDsl>) =>
        new TypeAttrTsDsl(...args),

      /** Creates a basic type reference or type expression (e.g. Foo or Foo<T>). */
      expr: (...args: ConstructorParameters<typeof TypeExprTsDsl>) =>
        new TypeExprTsDsl(...args),

      /** Creates a function type node (e.g. `(a: string) => number`). */
      func: (...args: ConstructorParameters<typeof TypeFuncTsDsl>) =>
        new TypeFuncTsDsl(...args),

      /** Creates an indexed-access type (e.g. `Foo<T>[K]`). */
      idx: (...args: ConstructorParameters<typeof TypeIdxTsDsl>) =>
        new TypeIdxTsDsl(...args),

      /** Creates a literal type node (e.g. 'foo', 42, or true). */
      literal: (...args: ConstructorParameters<typeof TypeLiteralTsDsl>) =>
        new TypeLiteralTsDsl(...args),

      /** Creates a type literal node (e.g. { foo: string }). */
      object: (...args: ConstructorParameters<typeof TypeObjectTsDsl>) =>
        new TypeObjectTsDsl(...args),

      /** Represents a union type (e.g. `A | B | C`). */
      or: (...args: ConstructorParameters<typeof TypeOrTsDsl>) =>
        new TypeOrTsDsl(...args),

      /** Creates a type parameter (e.g. `<T>`). */
      param: (...args: ConstructorParameters<typeof TypeParamTsDsl>) =>
        new TypeParamTsDsl(...args),

      /** Creates a type query node (e.g. `typeof Foo`). */
      query: (...args: ConstructorParameters<typeof TypeQueryTsDsl>) =>
        new TypeQueryTsDsl(...args),

      /** Creates a tuple type (e.g. [A, B, C]). */
      tuple: (...args: ConstructorParameters<typeof TypeTupleTsDsl>) =>
        new TypeTupleTsDsl(...args),
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

export { TsDsl } from './base';
