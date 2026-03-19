<script setup lang="ts">
const props = defineProps<{
  githubExamplePath?: string;
}>();
</script>

<template>
  <h2 id="examples" tabindex="-1">
    Examples
    <a class="header-anchor" href="#examples" aria-label="Permalink to “Examples”">​</a>
  </h2>
  <p>
    You can view live examples on
    <a
      href="https://stackblitz.com/orgs/github/hey-api/collections/openapi-ts-examples"
      target="_blank"
      rel="noreferrer"
      >StackBlitz</a
    >
    or on
    <a
      :href="`https://github.com/hey-api/openapi-ts/tree/main/examples${props.githubExamplePath ? props.githubExamplePath : ''}`"
      target="_blank"
      rel="noreferrer"
      >GitHub</a
    >.
  </p>
</template>
