import * as http from '@hey-api/test-utils';
import { describe, expect, it, test } from 'vitest';
import { computed, ref } from 'vue';

import { createClient } from '../client';
import { waitStatusFinished } from './utils';

describe('reactive buildUrl', () => {
  const client = createClient();

  const refExample = ref(1);
  const computedExample = computed(() => refExample.value + 1);

  const scenarios: {
    options: Parameters<typeof client.buildUrl>[0];
    update: () => void;
    url1: string;
    url2: string;
  }[] = [
    {
      options: { path: { fooId: refExample }, url: '/foo/{fooId}' },
      update: () => refExample.value++,
      url1: '/foo/1',
      url2: '/foo/2',
    },
    {
      options: { path: { fooId: computedExample }, url: '/foo/{fooId}' },
      update: () => refExample.value++,
      url1: '/foo/3',
      url2: '/foo/4',
    },
  ];

  it.each(scenarios)('returns $url', ({ options, update, url1, url2 }) => {
    expect(client.buildUrl(options)).toBe(url1);
    update();
    expect(client.buildUrl(options)).toBe(url2);
  });
});

describe('reactive path', () => {
  const client = createClient({ baseURL: 'https://localhost' });

  test('re-triggers GET on ref update', async () => {
    const server = http.newServer(http.mockPetHandlers('https://localhost'));

    const petId = ref(1);

    const result = await client.get({
      composable: 'useFetch',
      path: computed(() => ({ petId: petId.value })),
      url: '/pets/{petId}',
    });

    expect(result.data.value).toEqual(http.petsData[0]);
    expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(1);

    petId.value = 2; // update reactive ref, which should trigger a new GET.
    await waitStatusFinished(result.status);
    expect(result.data.value).toEqual(http.petsData[1]);

    await result.refresh(); // refetch and ensure it still uses 2.
    await waitStatusFinished(result.status);
    expect(result.data.value).toEqual(http.petsData[1]);

    expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(3);
  });

  test('does not trigger with immediate:false', async () => {
    const server = http.newServer(http.mockPetHandlers('https://localhost'));

    const petId = ref(1);

    const result = await client.get({
      asyncDataOptions: { immediate: false },
      composable: 'useFetch',
      path: computed(() => ({ petId: petId.value })),
      url: '/pets/{petId}',
    });

    // not invoked initially.
    expect(result.status.value).toBe('idle');
    expect(result.data.value).toBeNull();

    // then trigger after just by updating the ref.
    petId.value = 2;
    await waitStatusFinished(result.status);
    expect(result.data.value).toEqual(http.petsData[1]);
    expect(server.spy('get', '/pets/:id')).toHaveBeenCalledTimes(1);
  });
});

test('reactive query re-triggers GET on query ref update', async () => {
  const client = createClient({ baseURL: 'https://localhost' });
  const server = http.newServer(http.mockPetHandlers('https://localhost'));

  const species = ref<http.Pet['species'] | null>('dog');

  const result = await client.get({
    composable: 'useFetch',
    query: computed(() => ({ species: species.value })),
    url: '/pets',
  });

  expect(result.data.value).toEqual(
    http.petsData.filter((pet) => pet.species === 'dog'),
  );

  species.value = 'cat';
  await waitStatusFinished(result.status);
  expect(result.data.value).toEqual(
    http.petsData.filter((pet) => pet.species === 'cat'),
  );

  species.value = null; // no filter
  await waitStatusFinished(result.status);
  expect(result.data.value).toEqual(http.petsData);
  expect(server.spy('get', '/pets')).toHaveBeenCalledTimes(3);
});

test('reactive body re-triggers POST on body ref update', async () => {
  const client = createClient({ baseURL: 'https://localhost' });
  const server = http.newServer(http.mockPetHandlers('https://localhost'));

  const newPet = ref<Omit<http.Pet, 'id'>>({
    age: 3,
    name: 'Rex',
    species: 'dog',
  });

  const result = await client.post<'useFetch', http.Pet>({
    body: newPet,
    composable: 'useFetch',
    url: '/pets',
  });

  expect(result.data.value?.name).toEqual(newPet.value.name);
  expect(result.data.value?.age).toEqual(newPet.value.age);
  expect(result.data.value?.species).toEqual(newPet.value.species);
  expect(server.spy('post', '/pets')).toHaveBeenCalledTimes(1);

  // Update pet data
  newPet.value = {
    age: 1,
    name: 'Mittens',
    species: 'cat',
  };

  await waitStatusFinished(result.status);
  expect(result.data.value?.name).toEqual(newPet.value.name);
  expect(result.data.value?.age).toEqual(newPet.value.age);
  expect(result.data.value?.species).toEqual(newPet.value.species);
  expect(server.spy('post', '/pets')).toHaveBeenCalledTimes(2);
});

test('reactive headers re-triggers GET on header ref update', async () => {
  const client = createClient({ baseURL: 'https://localhost' });
  const server = http.newServer([http.mockVerboseHandler('https://localhost')]);

  const species = ref(
    new Headers({
      'X-Example-Header': 'example',
    }),
  );

  const result = await client.get<'useFetch', http.VerboseResponse>({
    composable: 'useFetch',
    headers: species,
    url: '/verbose',
  });

  const received = new Headers(result.data.value?.headers);
  expect(received.get('X-Example-Header')).toEqual('example');

  species.value = new Headers({
    'X-Example-Header': 'example2',
  });
  await waitStatusFinished(result.status);
  const received2 = new Headers(result.data.value?.headers);
  expect(received2.get('X-Example-Header')).toEqual('example2');

  server.expectAllCalled();
});
