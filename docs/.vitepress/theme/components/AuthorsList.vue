<script setup lang="ts">
type Person = {
  github: string;
  name: string;
};

defineProps<{
  people: Person[];
}>();
</script>

<template>
  <ul class="authors-list">
    <li v-for="person in people" :key="person.github">
      <a :href="person.github" rel="noopener noreferrer" target="_blank">
        <img :alt="person.name" :src="`${person.github}.png`" />
        <h3>{{ person.name }}</h3>
      </a>
    </li>
  </ul>
</template>
