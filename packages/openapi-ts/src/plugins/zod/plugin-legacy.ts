import { compiler } from '../../compiler';
import type { TypeScriptFile } from '../../generate/files';
import type { Model } from '../../types/client';
import type { PluginLegacyHandler } from '../types';
import type { Config } from './types';

const processArray = ({
  file,
  model,
}: {
  file: TypeScriptFile;
  model: Model;
}) => {
  const identifier = file.identifier({
    $ref: model.meta?.$ref || '',
    create: true,
    namespace: 'value',
  });

  if (!identifier.created) {
    return;
  }

  const zArrayExpression = compiler.callExpression({
    functionName: compiler.propertyAccessExpression({
      expression: 'z',
      name: 'array',
    }),
    parameters: [
      compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: 'z',
          name: model.base,
        }),
      }),
    ],
  });

  if (model.base === 'number') {
    let expression = zArrayExpression;

    if (model.minItems && model.maxItems && model.minItems === model.maxItems) {
      expression = compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression,
          name: 'length',
        }),
        parameters: [compiler.ots.number(model.minItems)],
      });
    } else {
      if (model.minItems) {
        expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression,
            name: 'min',
          }),
          parameters: [compiler.ots.number(model.minItems)],
        });
      }

      if (model.maxItems) {
        expression = compiler.callExpression({
          functionName: compiler.propertyAccessExpression({
            expression,
            name: 'max',
          }),
          parameters: [compiler.ots.number(model.maxItems)],
        });
      }
    }

    const statement = compiler.constVariable({
      exportConst: true,
      expression,
      name: identifier.name || '',
    });
    file.add(statement);
    return;
  }

  // console.warn('array!', model.base, model.name)
  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.callExpression({
      functionName: compiler.propertyAccessExpression({
        expression: 'z',
        name: 'object',
      }),
      parameters: [
        compiler.objectExpression({
          multiLine: true,
          obj: [],
        }),
      ],
    }),
    name: identifier.name || '',
  });
  file.add(statement);
};

export const handlerLegacy: PluginLegacyHandler<Config> = ({
  client,
  files,
  plugin,
}) => {
  const file = files[plugin.name];

  file.import({
    module: 'zod',
    name: 'z',
  });

  for (const model of client.models) {
    switch (model.export) {
      case 'array':
        return processArray({
          file,
          model,
        });
    }
  }
};
