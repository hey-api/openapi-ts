# Axios support

This tool allows you to generate a client based on the [`Axios`](https://www.npmjs.com/package/axios) client.
The advantage of the Axios client is that it works in both Node.js and Browser based environments.
If you want to generate the Axios based client then you can specify `--client axios` in the openapi call:

`openapi --input ./spec.json --output ./generated --client axios`

The only downside is that this client needs some additional dependencies to work (due to the missing FormData
classes in Node.js).

```
npm install axios --save-dev
npm install form-data@4.x --save-dev
```

In order to compile the project and resolve the imports, you will need to enable the `allowSyntheticDefaultImports`
in your `tsconfig.json` file.
