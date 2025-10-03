---
"@hey-api/openapi-ts": patch
---

feat(pinia-colada): query options use `defineQueryOptions`

### Updated Pinia Colada query options

Pinia Colada query options now use `defineQueryOptions` to improve reactivity support. Instead of calling the query options function, you can use one of the following approaches.

#### No params

```ts
useQuery(getPetsQuery);
```

#### Constant

```ts
useQuery(getPetByIdQuery, () => ({
  path: {
    petId: 1,
  },
}));
```

#### Reactive

```ts
const petId = ref<number | null>(1);

useQuery(getPetByIdQuery, () => ({
  path: {
    petId: petId.value,
  },
}));
```

#### Properties

```ts
const petId = ref<number | null>(1);

useQuery(() => ({
  ...getPetByIdQuery({
    path: { petId: petId.value as number },
  }),
  enabled: () => petId.value != null,
}));
```
