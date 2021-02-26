# OpenAPI Typescript Codegen

[![NPM][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][deps-image]][deps-url]
[![Coverage][coverage-image]][coverage-url]
[![Quality][quality-image]][quality-url]
[![Code Climate][climate-image]][climate-url]
[![Downloads][downloads-image]][downloads-url]

> Node.js library that generates Typescript clients based on the OpenAPI specification.

## Why?
- Frontend ❤️ OpenAPI, but we do not want to use JAVA codegen in our builds
- Quick, lightweight, robust and framework agnostic 🚀
- Supports generation of TypeScript clients
- Supports generations of fetch and XHR http clients
- Supports OpenAPI specification v2.0 and v3.0
- Supports JSON and YAML files for input
- Supports generation through CLI, Node.js and NPX
- Supports tsc and @babel/plugin-transform-typescript
- Supports external references using [`json-schema-ref-parser`](https://github.com/APIDevTools/json-schema-ref-parser/)

## Install

```
npm install openapi-typescript-codegen --save-dev
```


## Usage

```
$ openapi --help

  Usage: openapi [options]

  Options:
    -V, --version             output the version number
    -i, --input <value>       OpenAPI specification, can be a path, url or string content (required)
    -o, --output <value>      Output directory (required)
    -c, --client <value>      HTTP client to generate [fetch, xhr, node] (default: "fetch")
    --useOptions              Use options instead of arguments
    --useUnionTypes           Use union types instead of enums
    --exportCore <value>      Write core files to disk (default: true)
    --exportServices <value>  Write services to disk (default: true)
    --exportModels <value>    Write models to disk (default: true)
    --exportSchemas <value>   Write schemas to disk (default: false)

  Examples
    $ openapi --input ./spec.json
    $ openapi --input ./spec.json --output ./dist
    $ openapi --input ./spec.json --output ./dist --client xhr
```


## Example

**package.json**
```json
{
    "scripts": {
        "generate": "openapi --input ./spec.json --output ./dist"
    }
}
```

**NPX**

```
npx openapi-typescript-codegen --input ./spec.json --output ./dist
```

**Node.js API**

```javascript
const OpenAPI = require('openapi-typescript-codegen');

OpenAPI.generate({
    input: './spec.json',
    output: './dist'
});

// Or by providing the content of the spec directly 🚀
OpenAPI.generate({
    input: require('./spec.json'),
    output: './dist'
});
```


## Features

### Argument style vs. Object style `--useOptions`
There's no [named parameter](https://en.wikipedia.org/wiki/Named_parameter) in JavaScript or TypeScript, because of
that, we offer the flag `--useOptions` to generate code in two different styles.

**Argument-style:**
```typescript
function createUser(name: string, password: string, type?: string, address?: string) {
    // ...
}

// Usage
createUser('Jack', '123456', undefined, 'NY US');
```

**Object-style:**
```typescript
function createUser({ name, password, type, address }: {
    name: string,
    password: string,
    type?: string
    address?: string
}) {
    // ...
}

// Usage
createUser({
    name: 'Jack',
    password: '123456',
    address: 'NY US'
});
```

### Enums vs. Union Types `--useUnionTypes`
The OpenAPI spec allows you to define [enums](https://swagger.io/docs/specification/data-models/enums/) inside the
data model. By default, we convert these enums definitions to [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html).
However, these enums are merged inside the namespace of the model, this is unsupported by Babel, [see docs](https://babeljs.io/docs/en/babel-plugin-transform-typescript#impartial-namespace-support).
Because we also want to support projects that use Babel [@babel/plugin-transform-typescript](https://babeljs.io/docs/en/babel-plugin-transform-typescript),
we offer the flag `--useUnionTypes` to generate [union types](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-types)
instead of the traditional enums. The difference can be seen below:

**Enums:**
```typescript
// Model
export interface Order {
    id?: number;
    quantity?: number;
    status?: Order.status;
}

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
    status: Order.status.PLACED
}
```

**Union Types:**
```typescript
// Model
export interface Order {
    id?: number;
    quantity?: number;
    status?: 'placed' | 'approved' | 'delivered';
}

// Usage
const order: Order = {
    id: 1,
    quantity: 40,
    status: 'placed'
}
```

### Runtime schemas `--exportSchemas`
By default, the OpenAPI generator only exports interfaces for your models. These interfaces will help you during
development, but will not be available in JavaScript during runtime. However, Swagger allows you to define properties
that can be useful during runtime, for instance: `maxLength` of a string or a `pattern` to match, etc. Let's say
we have the following model:

```json
{
    "MyModel": {
        "required": [
            "key",
            "name"
        ],
        "type": "object",
        "properties": {
            "key": {
                "maxLength": 64,
                "pattern": "^[a-zA-Z0-9_]*$",
                "type": "string"
            },
            "name": {
                "maxLength": 255,
                "type": "string"
            },
            "enabled": {
                "type": "boolean",
                "readOnly": true
            },
            "modified": {
                "type": "string",
                "format": "date-time",
                "readOnly": true
            }
        }
    }
}
```

This will generate the following interface:

```typescript
export interface MyModel {
    key: string;
    name: string;
    readonly enabled?: boolean;
    readonly modified?: string;
}
```

The interface does not contain any properties like `maxLength` or `pattern`. However, they could be useful
if we wanted to create some form where a user could create such a model. In that form you would iterate
over the properties to render form fields based on their type and validate the input based on the `maxLength`
or `pattern` property. This requires us to have this information somewhere... For this we can use the
flag `--exportSchemas` to generate a runtime model next to the normal interface:

```typescript
export const $MyModel = {
    properties: {
        key: {
            type: 'string',
            isRequired: true,
            maxLength: 64,
            pattern: '^[a-zA-Z0-9_]*$',
        },
        name: {
            type: 'string',
            isRequired: true,
            maxLength: 255,
        },
        enabled: {
            type: 'boolean',
            isReadOnly: true,
        },
        modified: {
            type: 'string',
            isReadOnly: true,
            format: 'date-time',
        },
    },
};
```

These runtime object are prefixed with a `$` character and expose all the interesting attributes of a model
and its properties. We can now use this object to generate the form:

```typescript jsx
import { $MyModel } from './generated';

// Some pseudo code to iterate over the properties and return a form field
// the form field could be some abstract component that renders the correct
// field type and validation rules based on the given input.
const formFields = Object.entries($MyModel.properties).map(([key, value]) => (
    <FormField
        name={key}
        type={value.type}
        format={value.format}
        maxLength={value.maxLength}
        pattern={value.pattern}
        isReadOnly={value.isReadOnly}
    />
));

const MyForm = () => (
    <form>
        {formFields}
    </form>
);

```


### Enum with custom names and descriptions
You can use `x-enum-varnames` and `x-enum-descriptions` in your spec to generate enum with custom names and descriptions.
It's not in official [spec](https://github.com/OAI/OpenAPI-Specification/issues/681) yet. But it's a supported extension
that can help developers use more meaningful enumerators.
```json
{
    "EnumWithStrings": {
        "description": "This is a simple enum with strings",
        "enum": [
            0,
            1,
            2
        ],
        "x-enum-varnames": [
            "Success",
            "Warning",
            "Error"
        ],
        "x-enum-descriptions": [
            "Used when the status of something is successful",
            "Used when the status of something has a warning",
            "Used when the status of something has an error"
        ]
    }
}
```

Generated code:
```typescript
enum EnumWithStrings {
    /*
    * Used when the status of something is successful
    */
    Success = 0,
    /*
    * Used when the status of something has a warning
    */
    Waring = 1,
    /*
    * Used when the status of something has an error
    */
    Error = 2,
}
```


### Nullable in OpenAPI v2
In the OpenAPI v3 spec you can create properties that can be NULL, by providing a `nullable: true` in your schema.
However, the v2 spec does not allow you to do this. You can use the unofficial `x-nullable` in your specification
to generate nullable properties in OpenApi v2.

```json
{
    "ModelWithNullableString": {
        "required": ["requiredProp"],
        "description": "This is a model with one string property",
        "type": "object",
        "properties": {
            "prop": {
                "description": "This is a simple string property",
                "type": "string",
                "x-nullable": true
            },
            "requiredProp": {
                "description": "This is a simple string property",
                "type": "string",
                "x-nullable": true
            }
        }
    }
}
```

Generated code:
```typescript
interface ModelWithNullableString {
    prop?: string | null,
    requiredProp: string | null,
}
```


### Authorization
The OpenAPI generator supports Bearer Token authorization. In order to enable the sending
of tokens in each request you can set the token using the global OpenAPI configuration:

```typescript
import { OpenAPI } from './generated';

OpenAPI.TOKEN = 'some-bearer-token';
```

Alternatively, we also support an async method that provides the token for each request.
You can simply assign this method to the same `TOKEN `property in the global OpenAPI object.

```typescript
import { OpenAPI } from './generated';

const getToken = async () => {
    // Some code that requests a token...
    return 'SOME_TOKEN';
}

OpenAPI.TOKEN = getToken;
```

### References

Local references to schema definitions (those beginning with `#/definitions/schemas/`)
will be converted to type references to the equivalent, generated top-level type.

The OpenAPI generator also supports external references, which allows you to break
down your openapi.yml into multiple sub-files, or incorporate third-party schemas
as part of your types to ensure everything is able to be TypeScript generated.

External references may be:
* *relative references* - references to other files at the same location e.g.
    `{ $ref: 'schemas/customer.yml' }`
* *remote references* - fully qualified references to another remote location
     e.g. `{ $ref: 'https://myexampledomain.com/schemas/customer_schema.yml' }`

    For remote references, both files (when the file is on the current filesystem)
    and http(s) URLs are supported.

External references may also contain internal paths in the external schema (e.g.
`schemas/collection.yml#/definitions/schemas/Customer`) and back-references to
the base openapi file or between files (so that you can reference another
schema in the main file as a type of an object or array property, for example).

At start-up, an OpenAPI or Swagger file with external references will be "bundled",
so that all external references and back-references will be resolved (but local
references preserved).

### Compare to other generators
Depending on which swagger generator you use, you will see different output.
For instance: Different ways of generating models, services, level of quality,
HTTP client, etc. I've compiled a list with the results per area and how they
compare against the openapi-typescript-codegen.

[Click here to see the comparison](https://htmlpreview.github.io/?https://github.com/ferdikoomen/openapi-typescript-codegen/blob/master/samples/index.html)


FAQ
===

### Babel support
If you use enums inside your models / definitions then those enums are by default inside a namespace with the same name
as your model. This is called declaration merging. However, the [@babel/plugin-transform-typescript](https://babeljs.io/docs/en/babel-plugin-transform-typescript)
does not support these namespaces, so if you are using babel in your project please use the `--useUnionTypes` flag
to generate union types instead of traditional enums. More info can be found here: [Enums vs. Union Types](#enums-vs-union-types---useuniontypes).

**Note:** If you are using Babel 7 and Typescript 3.8 (or higher) then you should enable the `onlyRemoveTypeImports` to
ignore any 'type only' imports, see https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports for more info

```javascript
module.exports = {
    presets: [
        ['@babel/preset-typescript', {
            onlyRemoveTypeImports: true,
        }],
    ],
};
```


### Node.js support
By default, this library will generate a client that is compatible with the (browser based) [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API),
however this client will not work inside the Node.js environment. If you want to generate a Node.js compatible client then
you can specify `--client node` in the openapi call:

`openapi --input ./spec.json --output ./dist --client node`

This will generate a client that uses [`node-fetch`](https://www.npmjs.com/package/node-fetch) internally. However,
in order to compile and run this client, you will need to install the `node-fetch` dependencies:

```
npm install @types/node-fetch --save-dev
npm install node-fetch --save-dev
npm install form-data --save-dev
```

In order to compile the project and resolve the imports, you will need to enable the `allowSyntheticDefaultImports`
in your `tsconfig.json` file.

```json
{
    "allowSyntheticDefaultImports": true
}
```


[npm-url]: https://npmjs.org/package/openapi-typescript-codegen
[npm-image]: https://img.shields.io/npm/v/openapi-typescript-codegen.svg
[license-url]: LICENSE
[license-image]: http://img.shields.io/npm/l/openapi-typescript-codegen.svg
[travis-url]: https://travis-ci.org/ferdikoomen/openapi-typescript-codegen
[travis-image]: https://img.shields.io/travis/ferdikoomen/openapi-typescript-codegen.svg
[deps-url]: https://david-dm.org/ferdikoomen/openapi-typescript-codegen
[deps-image]: https://img.shields.io/david/ferdikoomen/openapi-typescript-codegen.svg
[coverage-url]: https://codecov.io/gh/ferdikoomen/openapi-typescript-codegen
[coverage-image]: https://img.shields.io/codecov/c/github/ferdikoomen/openapi-typescript-codegen.svg
[quality-url]: https://lgtm.com/projects/g/ferdikoomen/openapi-typescript-codegen
[quality-image]: https://img.shields.io/lgtm/grade/javascript/g/ferdikoomen/openapi-typescript-codegen.svg
[climate-url]: https://codeclimate.com/github/ferdikoomen/openapi-typescript-codegen
[climate-image]: https://img.shields.io/codeclimate/maintainability/ferdikoomen/openapi-typescript-codegen.svg
[downloads-url]: http://npm-stat.com/charts.html?package=openapi-typescript-codegen
[downloads-image]: http://img.shields.io/npm/dm/openapi-typescript-codegen.svg
