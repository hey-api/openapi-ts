// This file is auto-generated by @hey-api/openapi-ts

import { type Options, serviceWithEmptyTag, patchApiVbyApiVersionNoTag, fooWow, deleteCallWithoutParametersAndResponse, getCallWithoutParametersAndResponse, patchCallWithoutParametersAndResponse, postCallWithoutParametersAndResponse, putCallWithoutParametersAndResponse, callWithDescriptions, callWithParameters, callWithWeirdParameterNames, callWithDefaultParameters, callWithDefaultOptionalParameters, callToTestOrderOfParams, duplicateName, duplicateName2, duplicateName3, duplicateName4, callWithNoContentResponse, callWithResponseAndNoContentResponse, dummyA, dummyB, callWithResponse, callWithDuplicateResponses, callWithResponses, collectionFormat, types, complexTypes, callWithResultFromHeader, testErrorCode, nonAsciiæøåÆøÅöôêÊ字符串, postApiVbyApiVersionBody } from '../sdk.gen';
import { queryOptions, type MutationOptions, type DefaultError } from '@tanstack/angular-query-experimental';
import type { ServiceWithEmptyTagData, PatchApiVbyApiVersionNoTagData, FooWowData, DeleteCallWithoutParametersAndResponseData, GetCallWithoutParametersAndResponseData, PatchCallWithoutParametersAndResponseData, PostCallWithoutParametersAndResponseData, PutCallWithoutParametersAndResponseData, CallWithDescriptionsData, CallWithParametersData, CallWithWeirdParameterNamesData, CallWithDefaultParametersData, CallWithDefaultOptionalParametersData, CallToTestOrderOfParamsData, DuplicateNameData, DuplicateName2Data, DuplicateName3Data, DuplicateName4Data, CallWithNoContentResponseData, CallWithResponseAndNoContentResponseData, DummyAData, DummyBData, CallWithResponseData, CallWithDuplicateResponsesData, CallWithDuplicateResponsesError, CallWithDuplicateResponsesResponse, CallWithResponsesData, CallWithResponsesError, CallWithResponsesResponse, CollectionFormatData, TypesData, ComplexTypesData, CallWithResultFromHeaderData, TestErrorCodeData, NonAsciiæøåÆøÅöôêÊ字符串Data, NonAsciiæøåÆøÅöôêÊ字符串Response, PostApiVbyApiVersionBodyData, PostApiVbyApiVersionBodyError, PostApiVbyApiVersionBodyResponse } from '../types.gen';
import { transformQueryKey } from '../../../../../../../../runtimeConfigPath';
import { client as _heyApiClient } from '../client.gen';

export type QueryKey<TOptions extends Options> = [
    Pick<TOptions, 'baseUrl' | 'body' | 'headers' | 'path' | 'query'> & {
        _id: string;
        _infinite?: boolean;
    }
];

const createQueryKey = <TOptions extends Options>(id: string, options?: TOptions, infinite?: boolean): [
    QueryKey<TOptions>[0]
] => {
    const params: QueryKey<TOptions>[0] = { _id: id, baseUrl: (options?.client ?? _heyApiClient).getConfig().baseUrl } as QueryKey<TOptions>[0];
    if (infinite) {
        params._infinite = infinite;
    }
    if (options?.body) {
        params.body = options.body;
    }
    if (options?.headers) {
        params.headers = options.headers;
    }
    if (options?.path) {
        params.path = options.path;
    }
    if (options?.query) {
        params.query = options.query;
    }
    return [
        params
    ];
};

export const serviceWithEmptyTagQueryKey = (options?: Options<ServiceWithEmptyTagData>) => createQueryKey('serviceWithEmptyTag', options);

export const serviceWithEmptyTagOptions = (options?: Options<ServiceWithEmptyTagData>) => {
    const queryKey = serviceWithEmptyTagQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await serviceWithEmptyTag({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const patchApiVbyApiVersionNoTagMutation = (options?: Partial<Options<PatchApiVbyApiVersionNoTagData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<PatchApiVbyApiVersionNoTagData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await patchApiVbyApiVersionNoTag({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const fooWowMutation = (options?: Partial<Options<FooWowData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<FooWowData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await fooWow({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const deleteCallWithoutParametersAndResponseMutation = (options?: Partial<Options<DeleteCallWithoutParametersAndResponseData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<DeleteCallWithoutParametersAndResponseData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await deleteCallWithoutParametersAndResponse({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const getCallWithoutParametersAndResponseQueryKey = (options?: Options<GetCallWithoutParametersAndResponseData>) => createQueryKey('getCallWithoutParametersAndResponse', options);

export const getCallWithoutParametersAndResponseOptions = (options?: Options<GetCallWithoutParametersAndResponseData>) => {
    const queryKey = getCallWithoutParametersAndResponseQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await getCallWithoutParametersAndResponse({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const patchCallWithoutParametersAndResponseMutation = (options?: Partial<Options<PatchCallWithoutParametersAndResponseData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<PatchCallWithoutParametersAndResponseData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await patchCallWithoutParametersAndResponse({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const postCallWithoutParametersAndResponseQueryKey = (options?: Options<PostCallWithoutParametersAndResponseData>) => createQueryKey('postCallWithoutParametersAndResponse', options);

export const postCallWithoutParametersAndResponseOptions = (options?: Options<PostCallWithoutParametersAndResponseData>) => {
    const queryKey = postCallWithoutParametersAndResponseQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await postCallWithoutParametersAndResponse({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const postCallWithoutParametersAndResponseMutation = (options?: Partial<Options<PostCallWithoutParametersAndResponseData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<PostCallWithoutParametersAndResponseData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await postCallWithoutParametersAndResponse({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const putCallWithoutParametersAndResponseMutation = (options?: Partial<Options<PutCallWithoutParametersAndResponseData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<PutCallWithoutParametersAndResponseData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await putCallWithoutParametersAndResponse({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const callWithDescriptionsQueryKey = (options?: Options<CallWithDescriptionsData>) => createQueryKey('callWithDescriptions', options);

export const callWithDescriptionsOptions = (options?: Options<CallWithDescriptionsData>) => {
    const queryKey = callWithDescriptionsQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithDescriptions({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithDescriptionsMutation = (options?: Partial<Options<CallWithDescriptionsData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<CallWithDescriptionsData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await callWithDescriptions({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const callWithParametersQueryKey = (options: Options<CallWithParametersData>) => createQueryKey('callWithParameters', options);

export const callWithParametersOptions = (options: Options<CallWithParametersData>) => {
    const queryKey = callWithParametersQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithParameters({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithParametersMutation = (options?: Partial<Options<CallWithParametersData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<CallWithParametersData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await callWithParameters({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const callWithWeirdParameterNamesQueryKey = (options: Options<CallWithWeirdParameterNamesData>) => createQueryKey('callWithWeirdParameterNames', options);

export const callWithWeirdParameterNamesOptions = (options: Options<CallWithWeirdParameterNamesData>) => {
    const queryKey = callWithWeirdParameterNamesQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithWeirdParameterNames({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithWeirdParameterNamesMutation = (options?: Partial<Options<CallWithWeirdParameterNamesData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<CallWithWeirdParameterNamesData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await callWithWeirdParameterNames({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const callWithDefaultParametersQueryKey = (options: Options<CallWithDefaultParametersData>) => createQueryKey('callWithDefaultParameters', options);

export const callWithDefaultParametersOptions = (options: Options<CallWithDefaultParametersData>) => {
    const queryKey = callWithDefaultParametersQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithDefaultParameters({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithDefaultOptionalParametersQueryKey = (options?: Options<CallWithDefaultOptionalParametersData>) => createQueryKey('callWithDefaultOptionalParameters', options);

export const callWithDefaultOptionalParametersOptions = (options?: Options<CallWithDefaultOptionalParametersData>) => {
    const queryKey = callWithDefaultOptionalParametersQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithDefaultOptionalParameters({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithDefaultOptionalParametersMutation = (options?: Partial<Options<CallWithDefaultOptionalParametersData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<CallWithDefaultOptionalParametersData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await callWithDefaultOptionalParameters({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const callToTestOrderOfParamsMutation = (options?: Partial<Options<CallToTestOrderOfParamsData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<CallToTestOrderOfParamsData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await callToTestOrderOfParams({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const duplicateNameMutation = (options?: Partial<Options<DuplicateNameData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<DuplicateNameData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await duplicateName({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const duplicateName2QueryKey = (options?: Options<DuplicateName2Data>) => createQueryKey('duplicateName2', options);

export const duplicateName2Options = (options?: Options<DuplicateName2Data>) => {
    const queryKey = duplicateName2QueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await duplicateName2({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const duplicateName3QueryKey = (options?: Options<DuplicateName3Data>) => createQueryKey('duplicateName3', options);

export const duplicateName3Options = (options?: Options<DuplicateName3Data>) => {
    const queryKey = duplicateName3QueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await duplicateName3({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const duplicateName3Mutation = (options?: Partial<Options<DuplicateName3Data>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<DuplicateName3Data>> = {
        mutationFn: async (localOptions) => {
            const { data } = await duplicateName3({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const duplicateName4Mutation = (options?: Partial<Options<DuplicateName4Data>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<DuplicateName4Data>> = {
        mutationFn: async (localOptions) => {
            const { data } = await duplicateName4({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const callWithNoContentResponseQueryKey = (options?: Options<CallWithNoContentResponseData>) => createQueryKey('callWithNoContentResponse', options);

export const callWithNoContentResponseOptions = (options?: Options<CallWithNoContentResponseData>) => {
    const queryKey = callWithNoContentResponseQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithNoContentResponse({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithResponseAndNoContentResponseQueryKey = (options?: Options<CallWithResponseAndNoContentResponseData>) => createQueryKey('callWithResponseAndNoContentResponse', options);

export const callWithResponseAndNoContentResponseOptions = (options?: Options<CallWithResponseAndNoContentResponseData>) => {
    const queryKey = callWithResponseAndNoContentResponseQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithResponseAndNoContentResponse({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const dummyAQueryKey = (options?: Options<DummyAData>) => createQueryKey('dummyA', options);

export const dummyAOptions = (options?: Options<DummyAData>) => {
    const queryKey = dummyAQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await dummyA({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const dummyBQueryKey = (options?: Options<DummyBData>) => createQueryKey('dummyB', options);

export const dummyBOptions = (options?: Options<DummyBData>) => {
    const queryKey = dummyBQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await dummyB({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithResponseQueryKey = (options?: Options<CallWithResponseData>) => createQueryKey('callWithResponse', options);

export const callWithResponseOptions = (options?: Options<CallWithResponseData>) => {
    const queryKey = callWithResponseQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithResponse({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithDuplicateResponsesQueryKey = (options?: Options<CallWithDuplicateResponsesData>) => createQueryKey('callWithDuplicateResponses', options);

export const callWithDuplicateResponsesOptions = (options?: Options<CallWithDuplicateResponsesData>) => {
    const queryKey = callWithDuplicateResponsesQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithDuplicateResponses({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithDuplicateResponsesMutation = (options?: Partial<Options<CallWithDuplicateResponsesData>>) => {
    const mutationOptions: MutationOptions<CallWithDuplicateResponsesResponse, CallWithDuplicateResponsesError, Options<CallWithDuplicateResponsesData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await callWithDuplicateResponses({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const callWithResponsesMutation = (options?: Partial<Options<CallWithResponsesData>>) => {
    const mutationOptions: MutationOptions<CallWithResponsesResponse, CallWithResponsesError, Options<CallWithResponsesData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await callWithResponses({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const collectionFormatQueryKey = (options: Options<CollectionFormatData>) => createQueryKey('collectionFormat', options);

export const collectionFormatOptions = (options: Options<CollectionFormatData>) => {
    const queryKey = collectionFormatQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await collectionFormat({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const typesQueryKey = (options: Options<TypesData>) => createQueryKey('types', options);

export const typesOptions = (options: Options<TypesData>) => {
    const queryKey = typesQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await types({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const complexTypesQueryKey = (options: Options<ComplexTypesData>) => createQueryKey('complexTypes', options);

export const complexTypesOptions = (options: Options<ComplexTypesData>) => {
    const queryKey = complexTypesQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await complexTypes({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithResultFromHeaderQueryKey = (options?: Options<CallWithResultFromHeaderData>) => createQueryKey('callWithResultFromHeader', options);

export const callWithResultFromHeaderOptions = (options?: Options<CallWithResultFromHeaderData>) => {
    const queryKey = callWithResultFromHeaderQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await callWithResultFromHeader({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const callWithResultFromHeaderMutation = (options?: Partial<Options<CallWithResultFromHeaderData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<CallWithResultFromHeaderData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await callWithResultFromHeader({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const testErrorCodeQueryKey = (options: Options<TestErrorCodeData>) => createQueryKey('testErrorCode', options);

export const testErrorCodeOptions = (options: Options<TestErrorCodeData>) => {
    const queryKey = testErrorCodeQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await testErrorCode({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const testErrorCodeMutation = (options?: Partial<Options<TestErrorCodeData>>) => {
    const mutationOptions: MutationOptions<unknown, DefaultError, Options<TestErrorCodeData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await testErrorCode({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const nonAsciiæøåÆøÅöôêÊ字符串QueryKey = (options: Options<NonAsciiæøåÆøÅöôêÊ字符串Data>) => createQueryKey('nonAsciiæøåÆøÅöôêÊ字符串', options);

export const nonAsciiæøåÆøÅöôêÊ字符串Options = (options: Options<NonAsciiæøåÆøÅöôêÊ字符串Data>) => {
    const queryKey = nonAsciiæøåÆøÅöôêÊ字符串QueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await nonAsciiæøåÆøÅöôêÊ字符串({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const nonAsciiæøåÆøÅöôêÊ字符串Mutation = (options?: Partial<Options<NonAsciiæøåÆøÅöôêÊ字符串Data>>) => {
    const mutationOptions: MutationOptions<NonAsciiæøåÆøÅöôêÊ字符串Response, DefaultError, Options<NonAsciiæøåÆøÅöôêÊ字符串Data>> = {
        mutationFn: async (localOptions) => {
            const { data } = await nonAsciiæøåÆøÅöôêÊ字符串({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};

export const postApiVbyApiVersionBodyQueryKey = (options: Options<PostApiVbyApiVersionBodyData>) => createQueryKey('postApiVbyApiVersionBody', options);

export const postApiVbyApiVersionBodyOptions = (options: Options<PostApiVbyApiVersionBodyData>) => {
    const queryKey = postApiVbyApiVersionBodyQueryKey(options);
    return queryOptions({
        queryFn: async ({ signal }) => {
            const { data } = await postApiVbyApiVersionBody({
                ...options,
                ...queryKey[0],
                signal,
                throwOnError: true
            });
            return data;
        },
        queryKey: transformQueryKey(queryKey)
    });
};

export const postApiVbyApiVersionBodyMutation = (options?: Partial<Options<PostApiVbyApiVersionBodyData>>) => {
    const mutationOptions: MutationOptions<PostApiVbyApiVersionBodyResponse, PostApiVbyApiVersionBodyError, Options<PostApiVbyApiVersionBodyData>> = {
        mutationFn: async (localOptions) => {
            const { data } = await postApiVbyApiVersionBody({
                ...options,
                ...localOptions,
                throwOnError: true
            });
            return data;
        }
    };
    return mutationOptions;
};