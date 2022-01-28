# OpenAPI object

The library exposes a global OpenAPI object that can be used to configure the requests,
below you can find the properties and their usage.

**Example:**

```typescript
export const OpenAPI: OpenAPIConfig = {
    BASE: 'http://localhost:3000/api',
    VERSION: '2.0',
    WITH_CREDENTIALS: false,
    CREDENTIALS: 'include',
    TOKEN: undefined,
    USERNAME: undefined,
    PASSWORD: undefined,
    HEADERS: undefined,
    ENCODE_PATH: undefined,
};
```

Properties
===

### `OpenAPI.BASE`

The base path of the OpenAPI server, this is generated from the spec,
but can be overwritten to switch servers.

```typescript
if (process.env === 'development') {
    OpenAPI.BASE = 'http://staging.company.com:3000/api';
}
if (process.env === 'production') {
    OpenAPI.BASE = '/api';
}
```

### `OpenAPI.VERSION`

The version param in the OpenAPI paths `{api-version}`. The version is taken from the spec,
but can be updated to call multiple versions of the same OpenAPI backend.

### `OpenAPI.WITH_CREDENTIALS`

Similar to the [withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials)
property of the XHR specification. When set to true, cross-site requests should be made
using credentials such as cookies, authorization headers, etc.

### `OpenAPI.CREDENTIALS`

Similar to the [credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included)
property of the Fetch specification. When `OpenAPI.WITH_CREDENTIALS` is set to true,
this property controls the specific implementation for Fetch and Node-Fetch clients.
Valid values are: `include`, `omit` and `same-origin`.

### `OpenAPI.TOKEN`

Set the Bearer authentication token to use for the requests. This needs to be a valid
(non-expired) token, otherwise the request will fail. The property can be updated as often
as you want, this is useful for scenario's where the token would automatically refresh
after x minutes. This property also allows you to use an `async` method that will be resolved
before requests are made.

```typescript
OpenAPI.TOKEN = 'MY_TOKEN';

OpenAPI.TOKEN = async () => {
    // Note: loading this from a JSON file is not recommended ;-)
    const response = await fetch('configuration.json');
    const { token } = response.json();
    return token;
};
```

### `OpenAPI.USERNAME`

Set the basic authentication username, although not recommended, the basic authentication
header is still supported. The username and password hash will be calculated by the client
before sending the request. This property also allows you to use an `async` method that
will be resolved before requests are made.

```typescript
OpenAPI.USERNAME = 'john';

OpenAPI.USERNAME = async () => {
    // Note: loading this from a JSON file is not recommended ;-)
    const response = await fetch('configuration.json');
    const { username } = response.json();
    return username;
};
```

### `OpenAPI.PASSWORD`

Set the basic authentication password. See `OpenAPI.USERNAME` for more info.

```typescript
OpenAPI.PASSWORD = 'welcome123';

OpenAPI.PASSWORD = async () => {
    // Note: loading this from a JSON file is not recommended ;-)
    const response = await fetch('configuration.json');
    const { password } = response.json();
    return password;
};
```

### `OpenAPI.HEADERS`

This property allows you to specify additional headers to send for each request. This can be useful
for adding headers that are not generated through the spec. Or adding headers for tracking purposes.
This property also allows you to use an `async` method that will be resolved before requests are made.

```typescript
OpenAPI.HEADERS = {
    'x-navigator': window.navigator.appVersion,
    'x-environment': process.env,
    'last-modified': 'Wed, 21 Oct 2015 07:28:00 GMT',
};

OpenAPI.HEADERS = async () => {
    // Note: loading this from a JSON file is not recommended ;-)
    const response = await fetch('configuration.json');
    const { headers } = response.json();
    return headers;
};
```

### `OpenAPI.ENCODE_PATH`

By default, all path parameters are encoded using the `encodeURI` method. This will convert invalid
URL characters, for example spaces, backslashes, etc. However, you might want to make the encoding
more strict due to security restrictions. So you can set this to `encodeURIComponent` to encode
most non-alphanumerical characters to percentage encoding. Or set a customer encoder that just
replaces some special characters.

```typescript
OpenAPI.ENCODE_PATH = encodeURIComponent;

OpenAPI.ENCODE_PATH = (value: string) => {
    return value.replace(':', '_');
};
```
