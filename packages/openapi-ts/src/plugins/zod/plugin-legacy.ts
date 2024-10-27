import { compiler } from '../../compiler';
import type { TypeScriptFile } from '../../generate/files';
import type { Client, Model } from '../../types/client';
import type { PluginLegacyHandler } from '../types';
import type { Config } from './types';

interface TypesProps {
  client: Client;
  file: TypeScriptFile;
  model: Model;
  onRemoveNode?: VoidFunction;
}

const processArray = ({ file, model }: TypesProps) => {
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

  if (model.base === 'string' || model.base === 'boolean') {
    const statement = compiler.constVariable({
      exportConst: true,
      expression: zArrayExpression,
      name: identifier.name || '',
    });
    file.add(statement);
    return;
  }

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

const processGeneric = ({ file, model }: TypesProps) => {
  const identifier = file.identifier({
    $ref: model.meta?.$ref || '',
    create: true,
    namespace: 'value',
  });

  if (!identifier.created) {
    return;
  }

  if (model.base === 'string') {
    const statement = compiler.constVariable({
      exportConst: true,
      expression: compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: 'z',
          name: 'string',
        }),
      }),
      name: identifier.name || '',
    });
    file.add(statement);
    return;
  }

  if (model.base === 'boolean') {
    // console.warn(model)
    const statement = compiler.constVariable({
      exportConst: true,
      expression: compiler.callExpression({
        functionName: compiler.propertyAccessExpression({
          expression: 'z',
          name: 'boolean',
        }),
      }),
      name: identifier.name || '',
    });
    file.add(statement);
    return;
  }

  // console.warn(model.base)
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

const processModel = (props: TypesProps) => {
  switch (props.model.export) {
    case 'all-of':
    case 'any-of':
    case 'one-of':
    case 'interface':
      // return processComposition(props);
      return;
    case 'array':
      return processArray(props);
    case 'enum':
      // return processEnum(props);
      return;
    default:
      return processGeneric(props);
  }
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
    processModel({
      client,
      file,
      model,
    });
  }
};
