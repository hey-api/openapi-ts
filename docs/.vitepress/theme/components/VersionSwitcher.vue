<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vitepress';
import VueSelect from 'vue3-select-component';
import 'vue3-select-component/styles';

type Option = {
  label: string;
  short?: string;
  value: string;
};

const props = defineProps<{
  default: string;
  values: Array<Option>;
}>();

const route = useRoute();
const router = useRouter();

const selected = ref(getCurrentVersion(route.path));

function getCurrentVersion(path: string) {
  const segments = path.replace(/(^\/|\/$)/g, '').split('/');
  const versionValues = props.values.map((v) => v.value);
  const last = segments[segments.length - 1];
  return versionValues.includes(last) ? last : props.default;
}

function switchVersion(option: Option) {
  const path = route.path;
  const segments = path.replace(/(^\/|\/$)/g, '').split('/');
  const versionValues = props.values.map((v) => v.value);
  const last = segments[segments.length - 1];
  if (versionValues.includes(last)) {
    segments.pop();
  }
  if (option.value !== props.default) {
    segments.push(option.value);
  }
  const nextPath = `/${segments.filter(Boolean).join('/')}`;
  if (nextPath !== route.path) {
    router.go(nextPath);
  }
}
</script>

<template>
  <VueSelect
    v-model="selected"
    :isClearable="false"
    :options="props.values"
    @option-selected="switchVersion"
  >
    <template #value="{ option }">
      {{ option.short || option.label }}
    </template>
  </VueSelect>
</template>
