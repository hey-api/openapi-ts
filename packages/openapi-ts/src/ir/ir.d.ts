export interface IR {
  paths?: IRPathsObject;
}

interface IRPathsObject {
  [path: `/${string}`]: IRPathItemObject;
}

interface IRPathItemObject {
  delete?: IROperationObject;
  get?: IROperationObject;
  head?: IROperationObject;
  options?: IROperationObject;
  patch?: IROperationObject;
  post?: IROperationObject;
  put?: IROperationObject;
  trace?: IROperationObject;
}

interface IROperationObject {
  // callbacks?: Record<string, CallbackObject>;
  deprecated?: boolean;
  description?: string;
  // externalDocs?: ExternalDocumentationObject;
  id?: string;
  parameters?: IRParametersObject;
  // requestBody?: RequestBodyObject;
  // responses?: ResponsesObject;
  // security?: ReadonlyArray<SecurityRequirementObject>;
  // servers?: ReadonlyArray<ServerObject>;
  summary?: string;
  tags?: ReadonlyArray<string>;
}

export interface IRParametersObject {
  cookie?: Record<string, IRParameterObject>;
  header?: Record<string, IRParameterObject>;
  path?: Record<string, IRParameterObject>;
  query?: Record<string, IRParameterObject>;
}

interface IRParameterObject {
  // .
}
