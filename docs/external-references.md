# External references

Local references to schema definitions (those beginning with `#/definitions/schemas/`)
will be converted to type references to the equivalent, generated top-level type.

The OpenAPI generator also supports external references, which allows you to break
down your openapi.yml into multiple sub-files, or incorporate third-party schemas
as part of your types to ensure everything is able to be TypeScript generated.

External references may be:

* *relative references* - references to other files at the same location e.g.
  `{ $ref: 'schemas/customer.yml' }`

* *remote references* - fully qualified references to another remote location e.g.
  `{ $ref: 'https://myexampledomain.com/schemas/customer_schema.yml' }`

For remote references, both files (when the file is on the current filesystem)
and http(s) URLs are supported.

External references may also contain internal paths in the external schema (e.g.
`schemas/collection.yml#/definitions/schemas/Customer`) and back-references to
the base openapi file or between files (so that you can reference another
schema in the main file as a type of an object or array property, for example).

At start-up, an OpenAPI or Swagger file with external references will be "bundled",
so that all external references and back-references will be resolved (but local
references preserved).
