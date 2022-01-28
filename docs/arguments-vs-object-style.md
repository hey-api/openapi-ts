# Arguments vs. Object style

**Flag:** `--useOptions`

There's no [named parameter](https://en.wikipedia.org/wiki/Named_parameter) in JavaScript or TypeScript, because of
that, we offer the flag `--useOptions` to generate code in two different styles.

**Argument style:**

```typescript
const createUser = (name: string, password: string, type?: string, address?: string) => {
    // ...
};

// Usage
createUser('Jack', '123456', undefined, 'NY US');
```

**Object style:**

```typescript
const createUser = ({ name, password, type, address }: {
    name: string,
    password: string,
    type?: string
    address?: string
}) => {
    // ...
};

// Usage
createUser({
    name: 'Jack',
    password: '123456',
    address: 'NY US'
});
```
