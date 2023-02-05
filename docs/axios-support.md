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

In order to compile the project and resolve the imports, you will need to add the following properties
in your `tsconfig.json` file:
```json
{
    "compilerOptions": {
        "lib": ["...", "dom"],
        "allowSyntheticDefaultImports": true
    }
}
```


## Using a custom Axios client

Sometime you may want to use your own Axios client created by `axios.create` for advanced configuration (e.g. Usage of the popular [axios-retry](https://github.com/softonic/axios-retry) interceptor) without having to [reimplement](./custom-request-file.md) the entire generated Axios request function.

In those cases, simply construct your own HttpRequest wrapper implementation and pass it into your API client

## Example

Create a file that looks like this, that references file from the `/core` folder of the generated client.

```typescript

import axios from 'axios';
import axiosRetry from 'axios-retry';
import { request as __request } from './request';
import { CancelablePromise } from './CancelablePromise';
import { BaseHttpRequest } from './BaseHttpRequest';
import { ApiRequestOptions } from './ApiRequestOptions';
import type { OpenAPIConfig } from './OpenAPI';


export class AxiosHttpRequestWithRetry extends BaseHttpRequest {
  axiosInstance = axios.create();

  constructor(config: OpenAPIConfig) {
    super(config);
    axiosRetry(this.axiosInstance);
  }

  public override request<T>(options: ApiRequestOptions): CancelablePromise<T> {
    return __request(this.config, options, this.axiosInstance);
  }
}

```

Then, when instantiating your generated test client, pass in your custom request wrapper class:

```typescript

import { AxiosHttpRequestWithRetry } from './AxiosRequestWithRetry';
import { GeneratedClient } from './generated/client';

const client = new GeneratedClient({ BASE: 'http://localhost:8123' }, AxiosHttpRequestWithRetry)

```