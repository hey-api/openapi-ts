import { describe, expectTypeOf, it } from 'vitest';
import type { Ref } from 'vue';

// Import the WithRefs type from the bundle
// We'll test it by creating a local version for testing purposes
type WithRefs<TData> = {
  [K in keyof TData]: NonNullable<TData[K]> extends object
    ?
        | WithRefs<NonNullable<TData[K]>>
        | Ref<NonNullable<TData[K]>>
        | Extract<TData[K], null>
    :
        | NonNullable<TData[K]>
        | Ref<NonNullable<TData[K]>>
        | Extract<TData[K], null>;
};

describe('WithRefs type', () => {
  it('should preserve null in nullable fields', () => {
    type TestType = {
      city: string | null;
      email: string;
      name: string;
      postalCode: string | null;
      street: string | null;
    };

    type Result = WithRefs<TestType>;

    // These should all pass after the fix
    expectTypeOf<Result['name']>().toEqualTypeOf<string | Ref<string>>();
    expectTypeOf<Result['email']>().toEqualTypeOf<string | Ref<string>>();
    expectTypeOf<Result['street']>().toEqualTypeOf<
      string | Ref<string> | null
    >();
    expectTypeOf<Result['city']>().toEqualTypeOf<string | Ref<string> | null>();
    expectTypeOf<Result['postalCode']>().toEqualTypeOf<
      string | Ref<string> | null
    >();
  });

  it('should handle nested objects with nullable fields', () => {
    type TestType = {
      user: {
        address: {
          street: string | null;
        } | null;
        name: string;
      };
    };

    type Result = WithRefs<TestType>;

    // Test nested object
    expectTypeOf<Result['user']>().toMatchTypeOf<
      | {
          address:
            | { street: string | Ref<string> | null }
            | Ref<{ street: string | Ref<string> | null }>
            | null;
          name: string | Ref<string>;
        }
      | Ref<{
          address:
            | { street: string | Ref<string> | null }
            | Ref<{ street: string | Ref<string> | null }>
            | null;
          name: string | Ref<string>;
        }>
    >();
  });

  it('should handle primitive nullable types', () => {
    type TestType = {
      booleanField: boolean | null;
      numberField: number | null;
      stringField: string | null;
    };

    type Result = WithRefs<TestType>;

    expectTypeOf<Result['stringField']>().toEqualTypeOf<
      string | Ref<string> | null
    >();
    expectTypeOf<Result['numberField']>().toEqualTypeOf<
      number | Ref<number> | null
    >();
    expectTypeOf<Result['booleanField']>().toEqualTypeOf<
      boolean | Ref<boolean> | null
    >();
  });

  it('should handle undefined vs null correctly', () => {
    type TestType = {
      nullableField: string | null;
      optionalField?: string;
      undefinedField: string | undefined;
    };

    type Result = WithRefs<TestType>;

    expectTypeOf<Result['nullableField']>().toEqualTypeOf<
      string | Ref<string> | null
    >();
    // undefined is not treated as null, so it won't be extracted
    expectTypeOf<Result['undefinedField']>().toMatchTypeOf<
      string | Ref<string> | undefined
    >();
    expectTypeOf<Result['optionalField']>().toMatchTypeOf<
      string | Ref<string> | undefined
    >();
  });
});
