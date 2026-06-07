import { PydanticEnumDsl } from './decl/enum';
import { PydanticFieldDsl } from './decl/field';
import { PydanticModelDsl } from './decl/model';
import { PydanticRootModelDsl } from './decl/root-model';
import { PydanticTypeAliasDsl } from './decl/type-alias';
import { PydanticConstrainedTypeDsl } from './expr/constrained-type';
import { PydanticConstraintsDsl } from './expr/constraints';

const pydanticDsl = {
  /** Constrained type: a type with attached validation constraints and metadata. */
  constrainedType: (...args: ConstructorParameters<typeof PydanticConstrainedTypeDsl>) =>
    new PydanticConstrainedTypeDsl(...args),

  /** Constraints bag: validation constraints and field metadata. */
  constraints: (...args: ConstructorParameters<typeof PydanticConstraintsDsl>) =>
    new PydanticConstraintsDsl(...args),

  /** Pydantic enum class. */
  enum: (...args: ConstructorParameters<typeof PydanticEnumDsl>) => new PydanticEnumDsl(...args),

  /** Pydantic field. */
  field: (...args: ConstructorParameters<typeof PydanticFieldDsl>) => new PydanticFieldDsl(...args),

  /** Pydantic model class. */
  model: (...args: ConstructorParameters<typeof PydanticModelDsl>) => new PydanticModelDsl(...args),

  /** Pydantic RootModel class. */
  rootModel: (...args: ConstructorParameters<typeof PydanticRootModelDsl>) =>
    new PydanticRootModelDsl(...args),

  /** Pydantic type alias. */
  typeAlias: (...args: ConstructorParameters<typeof PydanticTypeAliasDsl>) =>
    new PydanticTypeAliasDsl(...args),
};

export const $ = Object.assign(
  (...args: ConstructorParameters<typeof PydanticModelDsl>) => new PydanticModelDsl(...args),
  pydanticDsl,
);

export { PydanticEnumDsl } from './decl/enum';
export { PydanticFieldDsl } from './decl/field';
export { PydanticModelDsl } from './decl/model';
export { PydanticRootModelDsl } from './decl/root-model';
export { PydanticTypeAliasDsl } from './decl/type-alias';
export { PydanticConstrainedTypeDsl } from './expr/constrained-type';
export { PydanticConstraintsDsl } from './expr/constraints';
