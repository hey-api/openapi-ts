# Client instances

**Flag:** `--name`

The OpenAPI generator allows creation of client instances to support the multiple backend services use case.
The generated client uses an instance of the server configuration and not the global `OpenAPI` constant.
To generate a client instance, set a custom name to the client class, use `--name` option.

```
openapi --input ./spec.json --output ./generated ---name AppClient
```

The generated client will be exported from the `index` file and can be used as shown below:

```typescript
// Create the client instance with server and authentication details
const appClient = new AppClient({
    BASE: 'http://server-host.com',
    TOKEN: '1234',
});

// Use the client instance to make the API call
const response = await appClient.organizations.createOrganization({
  name: 'OrgName',
  description: 'OrgDescription',
});
```
