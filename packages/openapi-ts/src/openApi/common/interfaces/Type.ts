export interface Type {
  $refs: string[];
  base: string;
  imports: string[];
  isNullable: boolean;
  template: string | null;
  type: string;
}
