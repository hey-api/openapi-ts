import { PydanticEnumDsl } from './decl/enum';
import { PydanticFieldDsl } from './decl/field';
import { PydanticModelDsl } from './decl/model';
import { PydTypeAliasPyDsl } from './decl/type-alias';

const pydanticDsl = {
  /** Pydantic enum class. */
  enum: (...args: ConstructorParameters<typeof PydanticEnumDsl>) => new PydanticEnumDsl(...args),

  /** Pydantic field. */
  field: (...args: ConstructorParameters<typeof PydanticFieldDsl>) => new PydanticFieldDsl(...args),

  /** Pydantic model class. */
  model: (...args: ConstructorParameters<typeof PydanticModelDsl>) => new PydanticModelDsl(...args),

  /** Pydantic type alias. */
  typeAlias: (...args: ConstructorParameters<typeof PydTypeAliasPyDsl>) =>
    new PydTypeAliasPyDsl(...args),
};

export const $ = Object.assign(
  (...args: ConstructorParameters<typeof PydanticModelDsl>) => new PydanticModelDsl(...args),
  pydanticDsl,
);

export { PydanticEnumDsl } from './decl/enum';
export { PydanticFieldDsl } from './decl/field';
export { PydanticModelDsl } from './decl/model';
export { PydTypeAliasPyDsl } from './decl/type-alias';
