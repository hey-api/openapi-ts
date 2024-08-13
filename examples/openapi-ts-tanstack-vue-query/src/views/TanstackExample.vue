<script lang="ts" setup>
import { $Pet, type Pet } from '@/client'
import {
  addPetMutation,
  getPetByIdOptions,
  updatePetMutation
} from '@/client/@tanstack/vue-query.gen'
import { createClient } from '@hey-api/client-fetch'
import { useMutation, useQuery } from '@tanstack/vue-query'
import { computed, ref, watch } from 'vue'

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

localClient.interceptors.request.use((request, options) => {
  // Middleware is great for adding authorization tokens to requests made to
  // protected paths. Headers are set randomly here to allow surfacing the
  // default headers, too.
  if (options.url === '/pet/{petId}' && options.method === 'GET' && Math.random() < 0.5) {
    request.headers.set('Authorization', 'Bearer <token_from_interceptor>')
  }
  return request
})

const pet = ref<Pet>()
const petId = ref<number>()
const isRequiredNameError = ref(false)

const petInput = ref({ name: '', category: '' })

const addPet = useMutation({
  ...addPetMutation,
  onError: (error) => {
    console.log(error)
    isRequiredNameError.value = false
  },
  onSuccess: (data) => {
    pet.value = data
    isRequiredNameError.value = false
  }
})

const updatePet = useMutation({
  ...updatePetMutation,
  onError: (error) => {
    console.log(error)
  },
  onSuccess: (data) => {
    pet.value = data
  }
})

const { data, error } = useQuery(
  computed(() => ({
    ...getPetByIdOptions({
      client: localClient,
      path: {
        petId: petId.value!
      }
    }),
    enabled: Boolean(petId.value)
  }))
)

const handleAddPet = async () => {
  if ($Pet.required.includes('name') && !petInput.value?.name?.length) {
    isRequiredNameError.value = true
    return
  }

  addPet.mutate({
    body: {
      category: {
        id: 0,
        name: petInput.value.category
      },
      id: 0,
      name: petInput.value?.name,
      photoUrls: ['string'],
      status: 'available',
      tags: [
        {
          id: 0,
          name: 'string'
        }
      ]
    }
  })
}

function setRandomPetId() {
  // random id 1-10
  petId.value = Math.floor(Math.random() * (10 - 1 + 1) + 1)
}

const handleUpdatePet = async () => {
  updatePet.mutate({
    body: {
      category: {
        id: pet.value?.category?.id ?? 0,
        name: petInput.value.category
      },
      id: pet.value?.id ?? 0,
      name: petInput.value.name,
      photoUrls: ['string'],
      status: 'available',
      tags: [
        {
          id: 0,
          name: 'string'
        }
      ]
    },
    // setting headers per request
    headers: {
      Authorization: 'Bearer <token_from_method>'
    }
  })
}

watch(data, () => {
  pet.value = data.value
})

watch(error, (error) => {
  console.log(error)
})
</script>

<template>
  <div class="bg-[#18191b] py-12">
    <div class="flex flex-col gap-12 max-w-md mx-auto">
      <div class="flex items-center">
        <a className="shrink-0" href="https://heyapi.vercel.app/" target="_blank">
          <img
            src="https://heyapi.vercel.app/logo.png"
            class="h-16 w-16 transition duration-300 will-change-auto"
            alt="Hey API logo"
          />
        </a>

        <h1 class="text-2xl font-bold text-white">@hey-api/openapi-ts 🤝 TanStack Vue Query</h1>
      </div>

      <div class="flex flex-col gap-2">
        <div
          class="p-2 bg-[#1f2123] border-[#575e64] rounded border flex gap-3 w-[50%] items-center"
        >
          <div
            class="rounded-full bg-[#233057] flex size-[40px] text-[#9eb1ff] text-lg font-medium place-content-center place-items-center"
          >
            <span>
              {{ pet?.name?.slice(0, 1) || 'N' }}
            </span>
          </div>

          <div>
            <p class="text-white text-sm font-bold">Name: {{ pet?.name || 'N/A' }}</p>

            <p class="text-[#f1f7feb5] text-sm">Category: {{ pet?.category?.name || 'N/A' }}</p>
          </div>
        </div>

        <button
          type="button"
          class="text-white p-1 font-medium text-sm rounded bg-[#3e63dd]"
          @click="setRandomPetId"
        >
          Get Random Pet
        </button>
      </div>

      <form @submit.prevent="handleAddPet" class="flex flex-col gap-3">
        <div class="flex flex-col gap-1 w-64">
          <label for="name" class="text-white font-medium">Name</label>

          <input
            v-model="petInput.name"
            name="name"
            required
            class="border rounded bg-[#121314] text-sm p-1 border-[#575e64] placeholder:text-[#575e64] text-white"
            placeholder="Kitty"
          />
        </div>

        <div class="flex flex-col gap-1 w-64">
          <label for="category" class="text-white font-medium">Category</label>

          <input
            v-model="petInput.category"
            name="category"
            required
            class="border rounded bg-[#121314] text-sm p-1 border-[#575e64] placeholder:text-[#575e64] text-white"
            placeholder="Cats"
          />
        </div>

        <div class="flex gap-2">
          <button type="submit" class="text-white p-2 font-medium text-sm rounded bg-[#3e63dd]">
            Add Pet
          </button>

          <button
            type="button"
            class="cursor- text-white p-2 font-medium text-sm rounded bg-[#3e63dd] disabled:cursor-not-allowed"
            @click="handleUpdatePet"
            :disabled="!pet"
          >
            Update Pet
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
