# Runtime schemas

**Flag:** `--exportSchemas`

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
export type MyModel = {
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
} as const;
```

These runtime object are prefixed with a `$` character and expose all the interesting attributes of a model
and its properties. We can now use this object to generate the form:

```typescript jsx
import { $MyModel } from './generated';

// Some pseudo code to iterate over the properties and return a form field
// the form field could be some abstract component that renders the correct
// field type and validation rules based on the given input.
const formFields = Object.entries($MyModel.properties)
    .map(([key, value]) => (
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
