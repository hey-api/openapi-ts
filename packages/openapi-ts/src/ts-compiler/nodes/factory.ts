import { createIdentifier } from './expressions/identifier';
import { createLiteral } from './expressions/literal';
import { createAssignment } from './statements/assignment';
import { createVariableStatement } from './statements/var';
import { createSourceFile } from './structure/sourceFile';

export const factory = {
  createAssignment,
  createIdentifier,
  createLiteral,
  createSourceFile,
  createVariableStatement,
};
