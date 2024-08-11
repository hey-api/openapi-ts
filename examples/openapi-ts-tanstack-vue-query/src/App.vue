<script setup lang="ts">
// import { useMutation, useQuery } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { RouterLink, RouterView } from 'vue-router'
import { addPetMutation } from './client/@tanstack/vue-query.gen'

const addPet = useMutation({
  ...addPetMutation,
  onError: (error) => {
    console.log(error)
    // setIsRequiredNameError(false);
  },
  onSuccess: (data) => {
    console.log(data)
    // setPet(data);
    // setIsRequiredNameError(false);
  }
})

const mutate = () => {
  addPet.mutate({
    body: {
      category: {
        id: 0,
        // name: formData.get('category') as string,
        name: 'Cats'
      },
      id: 0,
      // name: formData.get('name') as string,
      name: 'Kitty',
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
</script>

<template>
  <header>
    <img
      alt="Hey API logo"
      class="logo"
      src="https://heyapi.vercel.app/logo.png"
      width="125"
      height="125"
    />

    <div class="wrapper">
      <div class="greetings">
        <h1 class="green">@hey-api/openapi-ts 🤝 TanStack Vue Query</h1>
      </div>

      <button @click="mutate" type="button">Mutate</button>
      <!-- <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav> -->
    </div>
  </header>

  <RouterView />
  <VueQueryDevtools />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

/* from HelloWorld component */
h1 {
  font-size: 2rem;
  font-weight: 500;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
