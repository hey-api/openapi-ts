# Custom request file

If you want to implement custom logic on the request level,
or implement a client based on a different library, then
one option is to write your own request file and tell
the generator to use this.

The request file (`request.ts`) can be found inside the
`/core` folder of the generated client. You can modify
that file and use it, or alternatively, you can write
your own. Below is a very simplified example of an Axios
based request file:

```typescript
import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import type { ApiRequestOptions } from './ApiRequestOptions';
import { CancelablePromise } from './CancelablePromise';
import type { OpenAPIConfig } from './OpenAPI';

const axiosInstance = axios.create({
    // Your custom Axios instance config
});

export const request = <T>(config: OpenAPIConfig, options: ApiRequestOptions): CancelablePromise<T> => {
    return new CancelablePromise((resolve, reject, onCancel) => {
        // Get the request URL. Depending on your needs, this might need additional processing,
        // @see ./src/templates/core/functions/getUrl.hbs
        const url = `${config.BASE}${options.path}`;

        // Optional: Get and link the cancelation token, so the request can be aborted.
        const source = axiosInstance.CancelToken.source();
        onCancel(() => source.cancel('The user aborted a request.'));

        // Execute the request. This is a minimal example, in real world scenarios
        // you will need to add headers, process form data, etc.
        // @see ./src/templates/core/axios/request.hbs
        axiosInstance.request({
            url,
            data: options.body,
            method: options.method,
            cancelToken: source.token,
        }).then(data => {
            resolve(data);
        }).catch(error => {
            reject(error);
        });
    });
};
```

To use this request file in your generated code you can execute the
following command:

```
npx openapi-typescript-codegen --input ./spec.json --output ./generated --request ./request.ts
```

The `--request` parameter will tell the generator to not generate the default
`request.ts` file, but instead copy over the custom file that was specified.
