<script setup lang="ts">
import { useNuxtApp } from '#app';
import { computed, ref } from 'vue';

const nuxtApp = useNuxtApp();
const name = ref('foo');
const petId = ref(BigInt(8));
const status = ref<NonNullable<FindPetsByStatusData['query']>['status']>('available');
const apiResult = ref<any>(null);

const fetchMethod = ref<
  '$fetch' | 'useAsyncData' | 'useFetch' | 'useLazyAsyncData' | 'useLazyFetch'
>('$fetch');

async function callLocalApi() {
  try {
    apiResult.value = 'Loading...';
    const res = await $fetch(`/api/pet/${petId.value}`);
    apiResult.value = JSON.stringify(res, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
  } catch (err) {
    apiResult.value = String(err);
  }
}

function incrementPetId() {
  petId.value++;
}

async function addNewPet() {
  name.value = name.value === 'foo' ? 'bar' : 'foo';
  apiResult.value = 'Adding...';

  try {
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
    apiResult.value = JSON.stringify(pet, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2);
  } catch (error) {
    apiResult.value = String(error);
  }
}

function changeStatus() {
  status.value = status.value === 'available' ? 'pending' : 'available';
}

const query = computed(() => ({
  status: status.value,
}));

const petIdInput = computed({
  get: () => Number(petId.value),
  set: (val) => {
    petId.value = BigInt(val);
  },
});

async function handleFetch() {
  apiResult.value = 'Loading...';
  try {
    const result = await getPetById({
      composable: fetchMethod.value,
      key: `pet-${petId.value}-${Date.now()}`, // key dinámica para forzar la petición
      path: {
        petId: petId.value,
      },
    });

    console.log(`Result from ${fetchMethod.value}:`, result);

    let displayResult: any;
    if (fetchMethod.value === '$fetch') {
      displayResult = result;
    } else {
      // Nuxt composables return an object with Vue refs (data, pending, error, status, etc.)
      displayResult = {
        data: result.data?.value,
        error: result.error?.value,
        status: result.status?.value,
        pending: result.pending?.value,
      };
    }

    apiResult.value = JSON.stringify(
      displayResult,
      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      2,
    );
  } catch (error) {
    console.log(error);
    apiResult.value = String(error);
  }
}
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: sans-serif">
    <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1.5rem">
      Get Random Pet APIs with Nuxt v{{ nuxtApp.versions.nuxt }} and Vue v{{ nuxtApp.versions.vue }}
    </h1>

    <div
      style="
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      "
    >
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem">
        <label style="font-weight: bold">Fetch Method:</label>
        <select
          v-model="fetchMethod"
          style="padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc"
        >
          <option
            v-for="method in [
              '$fetch',
              'useFetch',
              'useAsyncData',
              'useLazyFetch',
              'useLazyAsyncData',
            ]"
            :key="method"
            :value="method"
          >
            {{ method }}
          </option>
        </select>
        <button
          @click="handleFetch"
          style="
            background: #007bff;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          Fetch Pet
        </button>
      </div>

      <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap">
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <label style="font-weight: bold; font-size: 0.875rem">Pet ID:</label>
          <input
            type="number"
            v-model="petIdInput"
            style="width: 80px; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px"
          />
        </div>
        <button
          @click="callLocalApi"
          style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          call /api/pet/:id (Nitro)
        </button>
        <button
          @click="incrementPetId"
          style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          increment petId
        </button>
        <button
          @click="changeStatus"
          style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          change status
        </button>
        <button
          @click="addNewPet"
          style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          add pet
        </button>
      </div>

      <div
        style="
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 0.875rem;
          border: 1px solid #e9ecef;
        "
      >
        <p style="margin: 0.25rem 0"><strong>id:</strong> {{ petId }}</p>
        <p style="margin: 0.25rem 0"><strong>name:</strong> {{ name }}</p>
        <p style="margin: 0.25rem 0"><strong>status:</strong> {{ status }}</p>
      </div>
    </div>

    <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem">Result:</h2>
    <div
      style="
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 1rem;
        border-radius: 8px;
        overflow: auto;
        max-height: 400px;
      "
    >
      <pre style="margin: 0">{{ apiResult }}</pre>
    </div>
  </div>
</template>
