# Node-Fetch support

By default, this tool will generate a client that is compatible with the (browser based) Fetch API.
However, this client will not work inside the Node.js environment. If you want to generate the Node.js compatible
client then you can specify `--client node` in the openapi call:

`openapi --input ./spec.json --output ./generated --client node`

This will generate a client that uses [`node-fetch`](https://www.npmjs.com/package/node-fetch) internally. However,
in order to compile and run this client, you might need to install the `node-fetch@2.x` dependencies.

> Since version 3.x [`node-fetch`](https://www.npmjs.com/package/node-fetch) switched to ESM only,
> breaking many CommonJS based toolchains (like Jest). Right now we do not support this new version!

```
npm install @types/node-fetch@2.x --save-dev
npm install abort-controller@3.x --save-dev
npm install form-data@4.x --save-dev
npm install node-fetch@2.x --save-dev
```

In order to compile the project and resolve the imports, you will need to enable the `allowSyntheticDefaultImports`
in your `tsconfig.json` file.
