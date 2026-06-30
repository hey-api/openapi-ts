import type { RequestResult } from '../bundle';

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

type SuccessResponseData<T> =
  Extract<Awaited<T>, { error: undefined }> extends {
    data: infer TData;
  }
    ? TData
    : never;

type JsonResponse = {
  applicationJson: {
    id: string;
  };
};

export type RequestResultParseAsAssertions = [
  Expect<
    Equal<
      SuccessResponseData<RequestResult<JsonResponse, unknown, false, 'fields', 'auto'>>,
      { id: string }
    >
  >,
  Expect<
    Equal<SuccessResponseData<RequestResult<JsonResponse, unknown, false, 'fields', 'blob'>>, Blob>
  >,
  Expect<
    Equal<
      SuccessResponseData<RequestResult<JsonResponse, unknown, false, 'fields', 'text'>>,
      string
    >
  >,
  Expect<
    Equal<
      SuccessResponseData<RequestResult<JsonResponse, unknown, false, 'fields', 'arrayBuffer'>>,
      ArrayBuffer
    >
  >,
];

describe('RequestResult', () => {
  it('types data by parseAs when provided', () => {
    expect(true).toBe(true);
  });
});
