import './App.css';

import * as Form from '@radix-ui/react-form';
import { DownloadIcon, PlusIcon, ReloadIcon } from '@radix-ui/react-icons';
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Heading,
  Section,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
// import useSWRInfinite from 'swr/infinite';
import useSWRMutation from 'swr/mutation';

import { createClient } from './client/client';
import { PetSchema } from './client/schemas.gen';
import { getInventory } from './client/sdk.gen';
import {
  addPetMutation,
  findPetsByStatusKey,
  findPetsByStatusOptions,
  getInventoryKey,
  getPetByIdOptions,
  loginUserKey,
  updatePetMutation,
} from './client/swr.gen';
// import { getPetByIdKey } from './client/swr.gen'; // For Pattern 2 example
import type { Pet } from './client/types.gen';

const localClient = createClient({
  // set default base url for requests made by this client
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  /**
   * Set default headers only for requests made by this client. This is to
   * demonstrate local clients and their configuration taking precedence over
   * internal service client.
   */
  headers: {
    Authorization: 'Bearer <token_from_local_client>',
  },
});

localClient.interceptors.request.use((request, options) => {
  // Middleware is great for adding authorization tokens to requests made to
  // protected paths. Headers are set randomly here to allow surfacing the
  // default headers, too.
  if (
    options.url === '/pet/{petId}' &&
    options.method === 'GET' &&
    Math.random() < 0.5
  ) {
    request.headers.set('Authorization', 'Bearer <token_from_interceptor>');
  }
  return request;
});

function App() {
  const [pet, setPet] = useState<Pet>();
  const [petId, setPetId] = useState<number>();
  const [isRequiredNameError, setIsRequiredNameError] = useState(false);
  const [showAdvancedExamples, setShowAdvancedExamples] = useState(false);

  // ============================================================================
  // Mutations - using the generated mutation options
  // ============================================================================
  // The mutation options provide the key and fetcher following SWR best practices
  const { fetcher: addPetFetcher, key: addPetKey } = addPetMutation();
  const addPet = useSWRMutation(addPetKey, addPetFetcher, {
    onError: (error) => {
      console.log(error);
      setIsRequiredNameError(false);
    },
    onSuccess: (data) => {
      setPet(data);
      setIsRequiredNameError(false);
    },
  });

  const { fetcher: updatePetFetcher, key: updatePetKey } = updatePetMutation();
  const updatePet = useSWRMutation(updatePetKey, updatePetFetcher, {
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      setPet(data);
    },
  });

  // ============================================================================
  // Pattern 1: Using Options (Recommended for most cases)
  // ============================================================================
  // The options provide both key and fetcher in the correct format
  // Conditional fetching is controlled by passing null to useSWR
  const petOptions = petId
    ? getPetByIdOptions({
        client: localClient,
        path: {
          petId: petId!,
        },
      })
    : null;

  const { data, error } = useSWR(
    petOptions?.key ?? null,
    petOptions?.fetcher ?? null,
  );

  // ============================================================================
  // Pattern 2: Using Key function directly (for custom fetchers)
  // ============================================================================
  // Key functions always return a valid key array, never null
  // This gives you full control over the fetcher while maintaining cache consistency
  //
  // Example (disabled to avoid duplicate requests):
  // const petByIdKey = petId ? getPetByIdKey({ path: { petId } }) : null;
  // const { data: customFetchedPet } = useSWR(petByIdKey, async (key) => {
  //   if (!key) return null;
  //   // Custom fetch logic here - you can add transforms, error handling, etc.
  //   console.log('Fetching with key:', key);
  //   const response = await fetch(`/api/pet/${key[1]}`);
  //   return response.json();
  // });

  // ============================================================================
  // Pattern 3: Optional parameters with optional chaining
  // ============================================================================
  // When options are optional, keys use optional chaining (options?.query)
  // This is safe and always returns a valid key
  const inventoryKey = getInventoryKey(); // No params needed
  const { data: inventory } = useSWR(
    showAdvancedExamples ? inventoryKey : null,
    async () => {
      // Custom fetcher - you control the implementation
      const { data } = await getInventory({
        client: localClient,
        throwOnError: true,
      });
      return data;
    },
  );

  // ============================================================================
  // Pattern 4: Required parameters
  // ============================================================================
  // When parameters are required, options must be provided
  // The key function directly accesses options.query without optional chaining
  const petsByStatusKey = findPetsByStatusKey({
    query: { status: 'available' },
  });

  // Or use the full options for convenience
  const { fetcher: petsByStatusFetcher, key: petsByStatusKey2 } =
    findPetsByStatusOptions({
      client: localClient,
      query: { status: 'available' },
    });

  const { data: availablePets } = useSWR(
    showAdvancedExamples ? petsByStatusKey2 : null,
    showAdvancedExamples ? petsByStatusFetcher : null,
  );

  // ============================================================================
  // Pattern 5: Demonstrating key equality for cache consistency
  // ============================================================================
  // Keys with the same parameters will have the same cache entry
  // This is a core SWR v2 improvement - primitive values in key arrays
  const loginKey1 = loginUserKey({
    query: { password: 'pass', username: 'test' },
  });
  const loginKey2 = loginUserKey({
    query: { password: 'pass', username: 'test' },
  });
  // loginKey1 and loginKey2 will be treated as the same cache key by SWR
  // because they have the same primitive values: ['/user/login', { username: 'test', password: 'pass' }]

  const onAddPet = async (formData: FormData) => {
    // simple form field validation to demonstrate using schemas
    if (PetSchema.required.includes('name') && !formData.get('name')) {
      setIsRequiredNameError(true);
      return;
    }

    addPet.trigger({
      body: {
        category: {
          id: 0,
          name: formData.get('category') as string,
        },
        id: 0,
        name: formData.get('name') as string,
        photoUrls: ['string'],
        status: 'available',
        tags: [
          {
            id: 0,
            name: 'string',
          },
        ],
      },
    });
  };

  const onGetPetById = async () => {
    // random id 1-10
    setPetId(Math.floor(Math.random() * (10 - 1 + 1) + 1));
  };

  const onUpdatePet = async () => {
    updatePet.trigger({
      body: {
        category: {
          id: 0,
          name: 'Cats',
        },
        id: 2,
        name: 'Updated Kitty',
        photoUrls: ['string'],
        status: 'available',
        tags: [
          {
            id: 0,
            name: 'string',
          },
        ],
      },
      // setting headers per request
      headers: {
        Authorization: 'Bearer <token_from_method>',
      },
    });
  };

  useEffect(() => {
    if (error) {
      console.log(error);
      return;
    }
    setPet(data!);
  }, [data, error]);

  return (
    <Box
      style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}
    >
      <Container size="1">
        <Section size="1" />
        <Flex align="center">
          <a className="shrink-0" href="https://heyapi.dev/" target="_blank">
            <img
              src="https://heyapi.dev/logo.png"
              className="h-16 w-16 transition duration-300 will-change-auto"
              alt="Hey API logo"
            />
          </a>
          <Heading>@hey-api/openapi-ts 🤝 SWR</Heading>
        </Flex>
        <Section size="1" />

        {/* Main Demo Section */}
        <Flex direction="column" gapY="2">
          <Heading size="4">Basic Usage Demo</Heading>
          <Box maxWidth="240px">
            <Card>
              <Flex gap="3" align="center">
                <Avatar
                  size="3"
                  src={pet?.photoUrls[0]}
                  radius="full"
                  fallback={pet?.name.slice(0, 1) ?? 'N'}
                />
                <Box>
                  <Text as="div" size="2" weight="bold">
                    Name: {pet?.name ?? 'N/A'}
                  </Text>
                  <Text as="div" size="2" color="gray">
                    Category: {pet?.category?.name ?? 'N/A'}
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Box>
          <Button onClick={onGetPetById}>
            <DownloadIcon /> Get Random Pet
          </Button>
        </Flex>

        <Section size="1" />

        {/* Advanced Examples Toggle */}
        <Flex direction="column" gapY="2">
          <Button
            variant={showAdvancedExamples ? 'solid' : 'outline'}
            onClick={() => setShowAdvancedExamples(!showAdvancedExamples)}
          >
            {showAdvancedExamples ? 'Hide' : 'Show'} Advanced SWR v2 Examples
          </Button>

          {showAdvancedExamples && (
            <Card>
              <Flex direction="column" gapY="2">
                <Heading size="3">SWR v2 Key Patterns</Heading>

                <Box>
                  <Text size="2" weight="bold">
                    Inventory (Optional params):
                  </Text>
                  <Text size="1" color="gray">
                    Key: {JSON.stringify(inventoryKey)}
                  </Text>
                  <Text size="1">
                    Count:{' '}
                    {inventory ? Object.keys(inventory).length : 'Loading...'}
                  </Text>
                </Box>

                <Box>
                  <Text size="2" weight="bold">
                    Available Pets (Required params):
                  </Text>
                  <Text size="1" color="gray">
                    Key: {JSON.stringify(petsByStatusKey)}
                  </Text>
                  <Text size="1">
                    Found: {availablePets?.length ?? 'Loading...'} pets
                  </Text>
                </Box>

                <Box>
                  <Text size="2" weight="bold">
                    Key Equality Demo:
                  </Text>
                  <Text size="1" color="gray">
                    Key 1: {JSON.stringify(loginKey1)}
                  </Text>
                  <Text size="1" color="gray">
                    Key 2: {JSON.stringify(loginKey2)}
                  </Text>
                  <Text size="1" color="green">
                    ✓ These keys are equal and share the same cache
                  </Text>
                </Box>
              </Flex>
            </Card>
          )}
        </Flex>
        <Section size="1" />
        <Flex direction="column" gapY="2">
          <Form.Root
            className="w-[260px]"
            onSubmit={(event) => {
              event.preventDefault();
              onAddPet(new FormData(event.currentTarget));
            }}
          >
            <Form.Field className="grid mb-[10px]" name="email">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Name
                </Form.Label>
                {isRequiredNameError && (
                  <Form.Message className="text-[13px] text-white opacity-[0.8]">
                    Please enter a name
                  </Form.Message>
                )}
              </div>
              <Form.Control asChild>
                <TextField.Root placeholder="Kitty" name="name" type="text" />
              </Form.Control>
            </Form.Field>
            <Form.Field className="grid mb-[10px]" name="question">
              <div className="flex items-baseline justify-between">
                <Form.Label className="text-[15px] font-medium leading-[35px] text-white">
                  Category
                </Form.Label>
                <Form.Message
                  className="text-[13px] text-white opacity-[0.8]"
                  match="valueMissing"
                >
                  Please enter a category
                </Form.Message>
              </div>
              <Form.Control asChild>
                <TextField.Root
                  placeholder="Cats"
                  name="category"
                  type="text"
                  required
                />
              </Form.Control>
            </Form.Field>
            <Flex gapX="2">
              <Form.Submit asChild>
                <Button type="submit">
                  <PlusIcon /> Add Pet
                </Button>
              </Form.Submit>
              <Button onClick={onUpdatePet} type="button">
                <ReloadIcon /> Update Pet
              </Button>
            </Flex>
          </Form.Root>
        </Flex>
        <Section size="1" />
        {/*
          useSWRInfinite Example (for paginated endpoints):

          If your OpenAPI spec has pagination configured, the SWR plugin generates
          infinite options functions (e.g., findPetsByStatusInfinite).

          These functions return an object with:
          - getKey: Function that generates keys for each page
          - fetcher: Function that fetches a single page

          Example usage:

          import useSWRInfinite from 'swr/infinite';
          import { findPetsByStatusInfinite } from './client/swr.gen';

          function InfinitePetList() {
            // Get the infinite options with your query parameters
            const { getKey, fetcher } = findPetsByStatusInfinite({
              query: { status: 'available' }
            });

            const { data, size, setSize, isLoading } = useSWRInfinite(getKey, fetcher);

            const pets = data ? data.flat() : [];
            const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
            const isEmpty = data?.[0]?.length === 0;
            const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 20);

            return (
              <div>
                {pets.map((pet) => (
                  <Card key={pet.id}>
                    <Text>{pet.name}</Text>
                  </Card>
                ))}
                <Button
                  disabled={isLoadingMore || isReachingEnd}
                  onClick={() => setSize(size + 1)}
                >
                  {isLoadingMore ? 'Loading...' : isReachingEnd ? 'No more data' : 'Load more'}
                </Button>
              </div>
            );
          }

          Note: The infinite options are only generated for operations that have
          pagination configured in the OpenAPI spec.
        */}
      </Container>
    </Box>
  );
}

export default App;
