<script setup lang="ts">
const name = ref('foo');
const petId = ref(BigInt(8));
const status = ref<NonNullable<FindPetsByStatusData['query']>['status']>('available');

function incrementPetId() {
  petId.value++;
}

async function addNewPet() {
  name.value = name.value === 'foo' ? 'bar' : 'foo';

  const pet = await addPet({
    body: {
      category: {
        id: BigInt(0),
        name: 'cats',
      },
      id: BigInt(0),
      name: 'doggy',
      photoUrls: ['string'],
      status: 'available',
      tags: [
        {
          id: BigInt(0),
          name: 'string',
        },
      ],
    },
    composable: '$fetch',
  });

  console.log('Added new pet:', pet);
}

function changeStatus() {
  status.value = status.value === 'available' ? 'pending' : 'available';
}

const query = computed(() => ({
  status: status.value,
}));

/**
 * useAsyncData
 *
 * During SSR data is fetched only on the server side and transferred to the
 * client.
 *
 * This will NOT forward anything.
 * Result: { cookies: {} }
 */
// const { data } = await useAsyncData(() => getPetById())
async function submitHandler() {}
const asyncData = await getPetById({
  // fetchAdapter: (url, options) => fetch(url, options),
  // fetchAdapter: (url, options) => $fetch(url, options),
  // fetchAdapter: (url, options) => axiosInstance[(options.method || 'get').toLowerCase()](url, options),
  asyncDataOptions: {
    default: () => ({
      name: 'Default Pet',
      photoUrls: [],
    }),
    watch: [petId],
  },
  composable: 'useAsyncData',
  key: 'item',
  path: {
    petId,
  },
});
watch(asyncData.data, (newPet) => {
  console.log('pet', newPet);
});

await findPetsByStatus({
  asyncDataOptions: {
    watch: [status],
  },
  composable: 'useAsyncData',
  query,
});

/**
 * useAsyncData + useRequestFetch
 *
 * This will forward the user's headers to the event handler.
 * Result: { cookies: { foo: 'bar' } }
 */
const requestFetch = useRequestFetch();
const asyncDataWithRequestFetch = await getPetById({
  $fetch: requestFetch,
  composable: 'useAsyncData',
  path: {
    petId: BigInt(8),
  },
});

/**
 * useFetch
 *
 * You can also useFetch as shortcut of useAsyncData + $fetch.
 */
const fetch = await getPetById({
  composable: 'useFetch',
  path: {
    petId: BigInt(8),
  },
});

await addPet({
  asyncDataOptions: {
    watch: [name],
  },
  body: {
    category: {
      id: BigInt(0),
      name: 'Cats',
    },
    id: BigInt(0),
    name,
    photoUrls: ['string'],
    status: 'available',
    tags: [
      {
        id: BigInt(0),
        name: 'pet',
      },
    ],
  },
  composable: 'useAsyncData',
  key: 'addPet',
});

/**
 * useLazyAsyncData
 *
 * Navigation will occur before fetching is complete. Handle 'pending' and
 * 'error' states directly within your component's template.
 */
const lazyAsyncData = await getPetById({
  composable: 'useLazyAsyncData',
  key: 'count',
  path: {
    petId: BigInt(8),
  },
});
watch(lazyAsyncData.data, (newPet) => {
  // Because pet might start out null, you won't have access
  // to its contents immediately, but you can watch it.
  if (newPet) {
    console.log(newPet.name);
  }
});

/**
 * useLazyFetch
 *
 * Navigation will occur before fetching is complete. Handle 'pending' and
 * 'error' states directly within your component's template.
 */
const lazyFetch = await getPetById({
  composable: 'useLazyFetch',
  path: {
    petId: BigInt(8),
  },
});
watch(lazyFetch.data, (newPet) => {
  // Because pet might start out null, you won't have access
  // to its contents immediately, but you can watch it.
  if (newPet) {
    console.log(newPet.name);
  }
});

async function handleFetch() {
  try {
    const result = await getPetById({
      composable: '$fetch',
      onRequest: [
        () => {
          console.log('onRequest: local');
        },
      ],
      onResponse: [
        () => {
          console.log('onResponse: local');
        },
      ],
      path: {
        petId,
      },
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}
</script>

<template>
  <h1>Get Random Pet Nuxt APIs</h1>
  <div>
    <button @click="handleFetch" type="button">$fetch</button>
    <button @click="incrementPetId" type="button">increment petId</button>
    <button @click="changeStatus" type="button">change status</button>
    <button @click="addNewPet" type="button">add pet</button>
    <div>
      <p>id: {{ petId }}</p>
      <p>name: {{ name }}</p>
      <p>status: {{ status }}</p>
    </div>
  </div>
</template>
