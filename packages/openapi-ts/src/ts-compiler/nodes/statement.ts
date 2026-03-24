import type { TsAssignment } from './statements/assignment';
import type { TsVariableStatement } from './statements/var';

export type TsStatement = TsAssignment | TsVariableStatement;
