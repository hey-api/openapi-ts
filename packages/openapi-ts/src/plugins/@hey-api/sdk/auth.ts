import type { IR } from '../../../ir/types';
import type { Plugin } from '../../types';
import type { Config } from './types';

// copy-pasted from @hey-api/client-core, minus export statement
interface Auth {
  /**
   * Which part of the request do we use to send the auth?
   *
   * @default 'header'
   */
  in?: 'header' | 'query' | 'cookie';
  /**
   * Header or query parameter name.
   *
   * @default 'Authorization'
   */
  name?: string;
  scheme?: 'basic' | 'bearer';
  type: 'apiKey' | 'http';
}

// TODO: parser - handle more security types
const securitySchemeObjectToAuthObject = ({
  securitySchemeObject,
}: {
  securitySchemeObject: IR.SecurityObject;
}): Auth | undefined => {
  if (securitySchemeObject.type === 'openIdConnect') {
    return {
      scheme: 'bearer',
      type: 'http',
    };
  }

  if (securitySchemeObject.type === 'oauth2') {
    if (
      securitySchemeObject.flows.password ||
      securitySchemeObject.flows.authorizationCode ||
      securitySchemeObject.flows.clientCredentials ||
      securitySchemeObject.flows.implicit
    ) {
      return {
        scheme: 'bearer',
        type: 'http',
      };
    }

    return;
  }

  if (securitySchemeObject.type === 'apiKey') {
    if (securitySchemeObject.in === 'header') {
      return {
        name: securitySchemeObject.name,
        type: 'apiKey',
      };
    }

    if (
      securitySchemeObject.in === 'query' ||
      securitySchemeObject.in == 'cookie'
    ) {
      return {
        in: securitySchemeObject.in,
        name: securitySchemeObject.name,
        type: 'apiKey',
      };
    }

    return;
  }

  if (securitySchemeObject.type === 'http') {
    const scheme = securitySchemeObject.scheme.toLowerCase();
    if (scheme === 'bearer' || scheme === 'basic') {
      return {
        scheme: scheme as 'bearer' | 'basic',
        type: 'http',
      };
    }

    return;
  }
};

export const operationAuth = ({
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: Plugin.Instance<Config>;
}): Array<Auth> => {
  if (!operation.security || !plugin.auth) {
    return [];
  }

  const auth: Array<Auth> = [];

  for (const securitySchemeObject of operation.security) {
    const authObject = securitySchemeObjectToAuthObject({
      securitySchemeObject,
    });
    if (authObject) {
      auth.push(authObject);
    } else {
      console.warn(
        `❗️ SDK warning: unsupported security scheme. Please open an issue if you'd like it added https://github.com/hey-api/openapi-ts/issues\n${JSON.stringify(securitySchemeObject, null, 2)}`,
      );
    }
  }

  return auth;
};
