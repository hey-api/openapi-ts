import ts from 'typescript';

import { compiler } from '../../../compiler';
import type { Identifier } from '../../../generate/files';
import type { IR } from '../../../ir/types';
import { parseUrl } from '../../../utils/url';
import type { Plugin } from '../../types';
import { getClientBaseUrlKey, getClientPlugin } from '../client-core/utils';
import { typesId } from './ref';
import type { Config } from './types';

const stringType = compiler.keywordTypeNode({ keyword: 'string' });

const serverToBaseUrlType = ({ server }: { server: IR.ServerObject }) => {
  const url = parseUrl(server.url);

  if (url.protocol && url.host) {
    return compiler.literalTypeNode({
      literal: compiler.stringLiteral({ text: server.url }),
    });
  }

  return compiler.templateLiteralType({
    value: [
      url.protocol || stringType,
      '://',
      url.host || stringType,
      url.port ? `:${url.port}` : '',
      url.path || '',
    ],
  });
};

export const createClientOptions = ({
  context,
  identifier,
  servers,
}: {
  context: IR.Context;
  identifier: Identifier;
  plugin: Plugin.Instance<Config>;
  servers: ReadonlyArray<IR.ServerObject>;
}) => {
  const file = context.file({ id: typesId })!;

  if (!identifier.name) {
    return;
  }

  const client = getClientPlugin(context.config);

  const types: Array<ts.TypeNode> = servers.map((server) =>
    serverToBaseUrlType({ server }),
  );

  if (!servers.length) {
    types.push(stringType);
  } else if (!('strictBaseUrl' in client && client.strictBaseUrl)) {
    types.push(
      compiler.typeIntersectionNode({
        types: [stringType, ts.factory.createTypeLiteralNode([])],
      }),
    );
  }

  const typeClientOptions = compiler.typeAliasDeclaration({
    exportType: true,
    name: identifier.name,
    type: compiler.typeInterfaceNode({
      properties: [
        {
          name: getClientBaseUrlKey(context.config),
          type: compiler.typeUnionNode({ types }),
        },
      ],
      useLegacyResolution: false,
    }),
  });

  file.add(typeClientOptions);
};
