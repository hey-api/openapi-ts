<script setup lang="ts">
const props = defineProps<{
  value: string;
}>();
</script>

<template>
  <div class="container">
    <div class="control">
      <div class="value-container">
        {{ props.value }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  box-sizing: border-box;
  position: relative;
  width: var(--vs-width);
}

.control {
  align-items: center;
  background-color: var(--vs-background-color);
  border-radius: var(--vs-border-radius);
  border: var(--vs-border);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  min-height: var(--vs-min-height);
}

.value-container {
  align-items: center;
  display: grid;
  flex: 1 1 0%;
  overflow: hidden;
  padding: var(--vs-padding-y) calc(var(--vs-padding-x) * 1.4) var(--vs-padding-y)
    var(--vs-padding-x);
  position: relative;
}
</style>
