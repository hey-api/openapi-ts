<script lang="ts" setup>
import type { Pet } from '@/client'
import type { RequestOptions } from '@/client/client'
import { PiniaColadaDevtools } from '@pinia/colada-devtools'
import { createClient } from '@/client/client'
import { PetSchema } from '@/client/schemas.gen'
import {
  addPetMutation,
  getPetByIdQuery,
  getPetByIdQueryKey,
  updatePetMutation
} from '@/client/@pinia/colada.gen'
import { useQuery, useMutation, useQueryCache } from '@pinia/colada'
import { ref, watch } from 'vue'

const localClient = createClient({
  // set default base url for requests made by this client
  baseUrl: 'https://petstore3.swagger.io/api/v3',
  /**
   * Set default headers only for requests made by this client. This is to
   * demonstrate local clients and their configuration taking precedence over
   * internal service client.
   */
  headers: {
    Authorization: 'Bearer <token_from_local_client>'
  }
})

localClient.interceptors.request.use((request: Request, options: RequestOptions) => {
  // Middleware is great for adding authorization tokens to requests made to
  // protected paths. Headers are set randomly here to allow surfacing the
  // default headers, too.
  if (options.url === '/pet/{petId}' && options.method === 'GET' && Math.random() < 0.5) {
    request.headers.set('Authorization', 'Bearer <token_from_interceptor>')
  }
  return request
})

const isPetNameRequired = PetSchema.required.includes('name')

const petId = ref<number | undefined>()
const petInput = ref({ name: '', category: '' })

const { data: pet, error } = useQuery(() => ({
  ...getPetByIdQuery(petQueryOptions()),
  enabled: petId.value !== undefined
}))
const { mutateAsync: createPet } = useMutation(addPetMutation())
const { mutateAsync: updatePet } = useMutation(updatePetMutation())

const queryCache = useQueryCache()
async function invalidateCurrentPet() {
  const key = getPetByIdQueryKey(petQueryOptions())
  await queryCache.invalidateQueries({ key, exact: true })
}

async function updatePetIdAndInvalidate(newId: number | undefined) {
  if (newId !== undefined) {
    petId.value = newId
  }

  if (petId.value !== undefined) {
    await invalidateCurrentPet()
  }
}

async function handleAddPet() {
  if (isPetNameRequired && !petInput.value.name) return

  const result = await createPet({ body: buildPetBody() })
  if (!result) return

  await updatePetIdAndInvalidate(result.id)
}

async function handleUpdatePet() {
  if (!pet.value) return

  const result = await updatePet({
    body: buildPetBody(pet.value),
    headers: {
      Authorization: 'Bearer <token_from_method>'
    }
  })
  if (!result) return

  await updatePetIdAndInvalidate(result.id)
}

function petQueryOptions() {
  return {
    client: localClient,
    path: { petId: petId.value as number }
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function setRandomPetId() {
  petId.value = randomInt(1, 10)
}

function buildPetBody(base?: Partial<Pet>) {
  return {
    category: {
      id: base?.category?.id ?? 0,
      name: petInput.value.category
    },
    id: base?.id ?? 0,
    name: petInput.value.name,
    photoUrls: ['string'],
    status: 'available' as const,
    tags: [
      {
        id: 0,
        name: 'string'
      }
    ]
  }
}

watch(error, (error) => {
  console.log(error)
})
</script>

<template>
  <div class="bg-[#18191b] py-12">
    <div class="mx-auto flex max-w-md flex-col gap-12">
      <div class="flex items-center">
        <a class="shrink-0" href="https://heyapi.dev/" target="_blank">
          <img
            alt="Hey API logo"
            class="size-16 transition duration-300 will-change-auto"
            src="https://heyapi.dev/logo.png"
          />
        </a>

        <h1 class="text-2xl font-bold text-white">@hey-api/openapi-ts 🤝 Pinia Colada</h1>
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
            <p class="text-sm font-bold text-white">Name: {{ pet?.name || 'N/A' }}</p>

            <p class="text-sm text-[#f1f7feb5]">Category: {{ pet?.category?.name || 'N/A' }}</p>
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
            required
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
          <button class="rounded bg-[#3e63dd] p-2 text-sm font-medium text-white" type="submit">
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

  <pinia-colada-devtools />
</template>
