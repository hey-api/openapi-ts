import type { TsPropertyAssignment } from './property-assignment';
import type { TsShorthandPropertyAssignment } from './shorthand-property-assignment';
import type { TsSpreadAssignment } from './spread-assignment';

export type TsObjectLiteralElementLike =
  | TsPropertyAssignment
  | TsShorthandPropertyAssignment
  | TsSpreadAssignment;
