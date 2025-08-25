export type StringCase =
  | 'camelCase'
  | 'PascalCase'
  | 'preserve'
  | 'snake_case'
  | 'SCREAMING_SNAKE_CASE';

export type StringName = string | ((name: string) => string);
