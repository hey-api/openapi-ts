<script setup lang="ts">
import { ref } from 'vue';

import { createClient } from './client/client';
import { PetSchema } from './client/schemas.gen';
import { addPet, getPetById, updatePet } from './client/sdk.gen';
import type { Pet } from './client/types.gen';

const pet = ref<Pet | undefined>();
const petInput = ref({ name: '', category: '' });
const isPetNameRequired = PetSchema.required.includes('name');

const localClient = createClient({
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  headers: {
    Authorization: 'Bearer <token_from_local_client>',
  },
});

localClient.interceptors.request.use((request, options) => {
  if (
    options.url === '/pet/{petId}' &&
    options.method === 'GET' &&
    Math.random() < 0.5
  ) {
    request.headers.set('Authorization', 'Bearer <token_from_interceptor>');
  }
  return request;
});

localClient.interceptors.error.use((error) => {
  console.error(error);
  return error;
});

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function setRandomPetId() {
  const id = randomInt(1, 10);
  const { data, error } = await getPetById({
    client: localClient,
    path: { petId: id },
  });
  if (error) {
    console.error(error);
    return;
  }
  pet.value = data!;
}

function buildPetBody(base?: Partial<Pet>) {
  return {
    category: {
      id: base?.category?.id ?? 0,
      name: petInput.value.category,
    },
    id: base?.id ?? 0,
    name: petInput.value.name,
    photoUrls: ['string'],
    status: 'available' as const,
    tags: [
      {
        id: 0,
        name: 'string',
      },
    ],
  };
}

async function handleAddPet() {
  if (isPetNameRequired && !petInput.value.name) return;
  const { data, error } = await addPet({ body: buildPetBody() });
  if (error) {
    console.error(error);
    return;
  }
  pet.value = data!;
}

async function handleUpdatePet() {
  if (!pet.value) return;
  const { data, error } = await updatePet({
    body: buildPetBody(pet.value),
    headers: { Authorization: 'Bearer <token_from_method>' },
  });
  if (error) {
    console.error(error);
    return;
  }
  pet.value = data!;
}
</script>

<template>
  <div class="bg-[#18191b] py-12">
    <div class="mx-auto flex max-w-md flex-col gap-12">
      <div class="flex items-center">
        <a class="shrink-0" href="https://heyapi.dev/" target="_blank">
          <img
            alt="Hey API logo"
            class="size-16 transition duration-300 will-change-auto"
            src="https://heyapi.dev/assets/raw/logo.png"
          />
        </a>

        <h1 class="text-2xl font-bold text-white">
          @hey-api/openapi-ts 🤝 ofetch
        </h1>
      </div>

      <div class="flex flex-col gap-2">
        <div
          class="flex max-w-60 items-center gap-3 rounded border border-[#575e64] bg-[#1f2123] p-4"
        >
          <div
            class="flex size-10 place-content-center place-items-center rounded-full bg-[#233057] text-lg font-medium text-[#9eb1ff]"
          >
            <span>
              {{ pet?.name?.slice(0, 1) || 'N' }}
            </span>
          </div>

          <div>
            <p class="text-sm font-bold text-white">
              Name: {{ pet?.name || 'N/A' }}
            </p>

            <p class="text-sm text-[#f1f7feb5]">
              Category: {{ pet?.category?.name || 'N/A' }}
            </p>
          </div>
        </div>

        <button
          class="rounded bg-[#3e63dd] p-1 text-sm font-medium text-white"
          type="button"
          @click="setRandomPetId"
        >
          Get Random Pet
        </button>
      </div>

      <form class="flex flex-col gap-3" @submit.prevent="handleAddPet">
        <div class="flex w-64 flex-col gap-1">
          <label class="font-medium text-white" for="name">Name</label>

          <input
            v-model="petInput.name"
            class="rounded border border-[#575e64] bg-[#121314] p-1 text-sm text-white placeholder:text-[#575e64]"
            name="name"
            placeholder="Kitty"
            :required="isPetNameRequired"
          />
        </div>

        <div class="flex w-64 flex-col gap-1">
          <label class="font-medium text-white" for="category">Category</label>

          <input
            v-model="petInput.category"
            class="rounded border border-[#575e64] bg-[#121314] p-1 text-sm text-white placeholder:text-[#575e64]"
            name="category"
            placeholder="Cats"
            required
          />
        </div>

        <div class="flex gap-2">
          <button
            class="rounded bg-[#3e63dd] p-2 text-sm font-medium text-white"
            type="submit"
          >
            Add Pet
          </button>

          <button
            class="rounded bg-[#3e63dd] p-2 text-sm font-medium text-white disabled:cursor-not-allowed"
            :disabled="!pet"
            type="button"
            @click="handleUpdatePet"
          >
            Update Pet
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
