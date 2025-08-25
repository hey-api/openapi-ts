<script setup lang="ts">
const props = defineProps<{
  issueNumber: number;
  name: string;
}>();
</script>

<template>
  <div class="warning custom-block">
    <p class="custom-block-title">Excited about {{ props.name }}?</p>
    <p>
      Help us prioritize this feature by voting on
      <a
        :href="`https://github.com/hey-api/openapi-ts/issues/${props.issueNumber}`"
        rel="noreferrer"
        target="_blank"
        >GitHub</a
      >
      or consider becoming a
      <a href="/openapi-ts/community/spotlight">contributor</a>.
    </p>
  </div>
</template>
