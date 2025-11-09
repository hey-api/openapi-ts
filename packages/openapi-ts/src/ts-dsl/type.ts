import { TypeExprTsDsl } from './type/expr';
// import { TypeLiteralTsDsl } from './type/literal';
// import { TypeObjectTsDsl } from './type/object';
// import { TypeParamTsDsl } from './type/param';

const base = {
  expr: (...args: ConstructorParameters<typeof TypeExprTsDsl>) =>
    new TypeExprTsDsl(...args),

  // literal: (...args: ConstructorParameters<typeof TypeLiteralTsDsl>) =>
  //   new TypeLiteralTsDsl(...args),

  // object: (...args: ConstructorParameters<typeof TypeObjectTsDsl>) =>
  //   new TypeObjectTsDsl(...args),

  // param: (...args: ConstructorParameters<typeof TypeParamTsDsl>) =>
  //   new TypeParamTsDsl(...args),
};

/** Creates a general expression node. */
export const type = Object.assign(
  (...args: ConstructorParameters<typeof TypeExprTsDsl>) => new TypeExprTsDsl(...args),
  base,
);
