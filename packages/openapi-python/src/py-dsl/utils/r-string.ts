export class RString {
  readonly '~brand' = 'RString' as const;
  constructor(readonly value: string) {}
}

export function rString(value: string): RString {
  return new RString(value);
}
