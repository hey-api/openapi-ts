import type ts from 'typescript';

export type ZodSchema = {
  expression: ts.Expression;
  typeName?: string;
};
