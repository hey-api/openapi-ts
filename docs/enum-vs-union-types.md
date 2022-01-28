# Enums vs. Union types

**Flag:**  `--useUnionTypes`

The OpenAPI spec allows you to define [enums](https://swagger.io/docs/specification/data-models/enums/) inside the
data model. By default, we convert these enums definitions to [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html).
However, these enums are merged inside the namespace of the model, this is unsupported by Babel, [see docs](https://babeljs.io/docs/en/babel-plugin-transform-typescript#impartial-namespace-support).
Because we also want to support projects that use Babel [@babel/plugin-transform-typescript](https://babeljs.io/docs/en/babel-plugin-transform-typescript),
we offer the flag `--useUnionTypes` to generate [union types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-types)
instead of the traditional enums. The difference can be seen below:

**Enums:**

```typescript
// Model
export type Order = {
    id?: number;
    quantity?: number;
    status?: Order.status;
};

export namespace Order {
    export enum status {
        PLACED = 'placed',
        APPROVED = 'approved',
        DELIVERED = 'delivered',
    }
}

// Usage
const order: Order = {
    id: 1,
    quantity: 40,
    status: Order.status.PLACED,
};
```

**Union Types:**

```typescript
// Model
export type Order = {
    id?: number;
    quantity?: number;
    status?: 'placed' | 'approved' | 'delivered';
};

// Usage
const order: Order = {
    id: 1,
    quantity: 40,
    status: 'placed',
};
```
