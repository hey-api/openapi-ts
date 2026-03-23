export const identifiers = {
  primitives: {
    string: 'string',
    number: 'number',
    integer: 'number.integer',
    boolean: 'boolean',
    null: 'null',
    undefined: 'undefined',
    unknown: 'unknown',
    never: 'never',
  },
  string: {
    email: 'string.email',
    uuid: 'string.uuid',
    url: 'string.url',
    date: 'string.date',
    iso: 'string.date.iso',
    time: 'string.date.time',
    ip: 'string.ip',
    v4: 'string.ip.v4',
    v6: 'string.ip.v6',
  },
  number: {
    integer: 'number.integer',
  },
  type: {
    // Arktype doesn't have direct equivalents for all Valibot/Zod concepts
    // These are placeholders for future expansion
    unknown: 'unknown',
  },
};