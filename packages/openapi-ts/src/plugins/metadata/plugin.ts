import ts from 'typescript';

import type { Plugin } from '../types';
import type { Config } from './types';

export const handler: Plugin.Handler<Config> = ({ context, plugin }) => {
  const file = context.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  // Create const for every set info value
  const { info } = context.spec;
  Object.entries(info).forEach(([key, value]) => {
    const stringLiteral = ts.factory.createStringLiteral(value);
    const variableDeclaration = ts.factory.createVariableDeclaration(key, undefined, undefined, stringLiteral);
    const node = ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList([variableDeclaration], ts.NodeFlags.Const),
    );
    // add node to file
    file.add(node);
  });
};
