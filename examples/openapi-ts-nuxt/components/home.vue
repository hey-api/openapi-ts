<script setup lang="ts">
import { getPetById, type Pet } from '~/client';

// START
const baseUrl = 'https://petstore3.swagger.io/api/v3';
const finalUrl = `${baseUrl}/pet/8`;

// $fetch
// During SSR data is fetched twice, once on the server and once on the client.
const dollarFetch = await getPetById({
  composable: '$fetch',
});
const dollarFetchNuxt = await $fetch<Pet>(finalUrl);

// useAsyncData
// During SSR data is fetched only on the server side and transferred to the client.
const asyncData = await getPetById({
  composable: 'useAsyncData',
  key: 'item',
  asyncDataOptions: {},
});
const asyncDataNuxt = await useAsyncData<Pet>(() => $fetch(finalUrl));
const asyncDataWithKeyNuxt = await useAsyncData<Pet>('item', () =>
  $fetch(finalUrl),
);

// useFetch
// You can also useFetch as shortcut of useAsyncData + $fetch
const fetch = await getPetById({
  composable: 'useFetch',
  fetchOptions: {},
});
const fetchNuxt = await useFetch<Pet>(finalUrl);

// useLazyAsyncData
/* Navigation will occur before fetching is complete.
  Handle 'pending' and 'error' states directly within your component's template
*/
const lazyAsyncData = await getPetById({
  composable: 'useLazyAsyncData',
  key: 'count',
});
const lazyAsyncDataNuxt = await useLazyAsyncData<Pet>('count', () =>
  $fetch(finalUrl),
);
watch(lazyAsyncDataNuxt.data, (newCount) => {
  // Because count might start out null, you won't have access
  // to its contents immediately, but you can watch it.
});

// useLazyFetch
/* Navigation will occur before fetching is complete.
 * Handle 'pending' and 'error' states directly within your component's template
 */
const lazyFetch = await getPetById({
  composable: 'useLazyFetch',
});
const lazyFetchNuxt = await useLazyFetch<Pet>(finalUrl);
watch(lazyFetchNuxt.data, (newPosts) => {
  // Because posts might start out null, you won't have access
  // to its contents immediately, but you can watch it.
});

// useRequestFetch
// This will forward the user's headers to the `/api/foo` event handler
// Result: { cookies: { foo: 'bar' } }
const requestFetch = useRequestFetch();
const asyncDataFinal = await getPetById({
  composable: 'useAsyncData',
  requestFetch,
});
const asyncData2 = await useAsyncData<Pet>(() => requestFetch(finalUrl));
// This will NOT forward anything
// Result: { cookies: {} }
const asyncData3 = await useAsyncData<Pet>(() => $fetch(finalUrl));

// END

async function handleClick() {
  const result = await getPetById({
    composable: '$fetch',
    // @ts-expect-error
    path: {
      petId: 8,
    },
  });
  console.warn(result);
}
</script>

<template>
  <div>
    <button @click="handleClick">Get Random Pet</button>
  </div>
</template>
