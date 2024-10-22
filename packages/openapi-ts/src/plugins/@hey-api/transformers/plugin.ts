// import type ts from 'typescript';

import type { IRContext } from '../../../ir/context';
import type { IRPathItemObject, IRPathsObject } from '../../../ir/ir';
import { operationResponsesMap } from '../../../ir/operation';
// import { compiler } from '../compiler';
// import { getOperationKey } from '../openApi/common/parser/operation';
// import type { ModelMeta, OperationResponse } from '../types/client';
// import { isModelDate, unsetUniqueTypeName } from '../utils/type';
// import {
//   modelResponseTransformerTypeName,
//   operationResponseTransformerTypeName,
//   operationResponseTypeName,
// } from './services';
// import { generateType, type TypesProps } from './types';

const transformersId = 'transformers';

// interface ModelProps extends TypesProps {
//   meta?: ModelMeta;
//   path: Array<string>;
// }

// const dataVariableName = 'data';

// const getRefModels = ({
//   client,
//   model,
// }: Pick<TypesProps, 'client' | 'model'>) => {
//   const refModels = model.$refs.map((ref) => {
//     const refModel = client.models.find((model) => model.meta?.$ref === ref);
//     if (!refModel) {
//       throw new Error(
//         `Ref ${ref} could not be found. Transformers cannot be generated without having access to all refs.`,
//       );
//     }
//     return refModel;
//   });
//   return refModels;
// };

// const ensureModelResponseTransformerExists = (
//   props: Omit<ModelProps, 'path'>,
// ) => {
//   const modelName = props.model.meta!.name;

//   const { name } = generateType({
//     ...props,
//     meta: {
//       $ref: `transformers/${modelName}`,
//       name: modelName,
//     },
//     nameTransformer: modelResponseTransformerTypeName,
//     onCreated: (name) => {
//       const statements = processModel({
//         ...props,
//         meta: {
//           $ref: `transformers/${modelName}`,
//           name,
//         },
//         path: [dataVariableName],
//       });
//       generateResponseTransformer({
//         ...props,
//         async: false,
//         name,
//         statements,
//       });
//     },
//     type: `(${dataVariableName}: any) => ${modelName}`,
//   });

//   const result = {
//     created: Boolean(props.client.types[name]),
//     name,
//   };
//   return result;
// };

// const processArray = (props: ModelProps) => {
//   const { model } = props;
//   const refModels = getRefModels(props);

//   if (refModels.length === 1) {
//     const { created, name: nameModelResponseTransformer } =
//       ensureModelResponseTransformerExists({ ...props, model: refModels[0] });

//     if (!created) {
//       return [];
//     }

//     return [
//       compiler.transformArrayMutation({
//         path: props.path,
//         transformerName: nameModelResponseTransformer,
//       }),
//     ];
//   }

//   if (
//     isModelDate(model) ||
//     (model.link &&
//       !Array.isArray(model.link) &&
//       model.link.export === 'any-of' &&
//       model.link.properties.find((property) => isModelDate(property)))
//   ) {
//     return [
//       compiler.transformArrayMap({
//         path: props.path,
//         transformExpression: compiler.conditionalExpression({
//           condition: compiler.identifier({ text: 'item' }),
//           whenFalse: compiler.identifier({ text: 'item' }),
//           whenTrue: compiler.transformNewDate({
//             parameterName: 'item',
//           }),
//         }),
//       }),
//     ];
//   }

//   // Not transform for this type
//   return [];
// };

// const processProperty = (props: ModelProps) => {
//   const { model } = props;
//   const path = [...props.path, model.name];

//   if (
//     model.type === 'string' &&
//     model.export !== 'array' &&
//     isModelDate(model)
//   ) {
//     return [compiler.transformDateMutation({ path })];
//   }

//   // otherwise we recurse in case it's an object/array, and if it's not that will just bail with []
//   return processModel({
//     ...props,
//     model,
//     path,
//   });
// };

// const processModel = (props: ModelProps): ts.Statement[] => {
//   const { model } = props;

//   switch (model.export) {
//     case 'array':
//       return processArray(props);
//     case 'interface':
//       return model.properties.flatMap((property) =>
//         processProperty({ ...props, model: property }),
//       );
//     case 'reference': {
//       if (model.$refs.length !== 1) {
//         return [];
//       }
//       const refModels = getRefModels(props);

//       const { created, name: nameModelResponseTransformer } =
//         ensureModelResponseTransformerExists({ ...props, model: refModels[0] });

//       if (!created) {
//         return [];
//       }

//       return model.in === 'response'
//         ? [
//             compiler.expressionToStatement({
//               expression: compiler.callExpression({
//                 functionName: nameModelResponseTransformer,
//                 parameters: [dataVariableName],
//               }),
//             }),
//           ]
//         : compiler.transformFunctionMutation({
//             path: props.path,
//             transformerName: nameModelResponseTransformer,
//           });
//     }
//     // unsupported
//     default:
//       return [];
//   }
// };

// const generateResponseTransformer = ({
//   async,
//   client,
//   name,
//   statements,
// }: Pick<TypesProps, 'client'> & {
//   async: boolean;
//   name: string;
//   statements: Array<ts.Statement>;
// }) => {
//   const result = {
//     created: false,
//     name,
//   };

//   if (!statements.length) {
//     // clean up created type for response transformer if it turns out
//     // the transformer was never generated
//     unsetUniqueTypeName({
//       client,
//       name,
//     });
//     files.types?.removeNode();
//     return result;
//   }

//   const expression = compiler.arrowFunction({
//     async,
//     multiLine: true,
//     parameters: [
//       {
//         name: dataVariableName,
//       },
//     ],
//     statements: [
//       ...statements,
//       compiler.returnVariable({
//         expression: dataVariableName,
//       }),
//     ],
//   });
//   const statement = compiler.constVariable({
//     exportConst: true,
//     expression,
//     name,
//     typeName: name,
//   });
//   files.types?.add(statement);

//   return {
//     created: true,
//     name,
//   };
// };

// handles only response transformers for now
export const generateTransformers = ({
  context,
}: {
  context: IRContext;
}): void => {
  // TODO: parser - once transformers are a plugin, this logic can be simplified
  if (
    !context.config.services.export ||
    // client.services.length &&
    context.config.types.dates !== 'types+transform'
  ) {
    return;
  }

  context.createFile({
    id: transformersId,
    path: 'transformers',
  });

  for (const path in context.ir.paths) {
    const pathItem = context.ir.paths[path as keyof IRPathsObject];

    for (const _method in pathItem) {
      const method = _method as keyof IRPathItemObject;
      const operation = pathItem[method]!;

      const { response } = operationResponsesMap(operation);

      if (!response) {
        continue;
      }

      if (response.items && response.items.length > 1) {
        if (context.config.debug) {
          console.warn(
            `❗️ Transformers warning: route ${`${method.toUpperCase()} ${path}`} has ${response.items.length} non-void success responses. This is currently not handled and we will not generate a response transformer. Please open an issue if you'd like this feature https://github.com/hey-api/openapi-ts/issues`,
          );
        }
        continue;
      }

      // console.warn(operation.id, response)

      // const name = operationResponseTypeName(operation.name);
      // generateType({
      //   client,
      //   meta: {
      //     $ref: `transformers/${name}`,
      //     name,
      //   },
      //   nameTransformer: operationResponseTransformerTypeName,
      //   onCreated: (nameCreated) => {
      //     const statements =
      //       successResponses.length > 1
      //         ? successResponses.flatMap((response) => {
      //             const statements = processModel({
      //               client,
      //               meta: {
      //                 $ref: `transformers/${name}`,
      //                 name,
      //               },
      //               model: response,
      //               path: [dataVariableName],
      //             });

      //             // assume unprocessed responses are void
      //             if (!statements.length) {
      //               return [];
      //             }

      //             return [
      //               compiler.ifStatement({
      //                 expression: compiler.safeAccessExpression(['data']),
      //                 thenStatement: ts.factory.createBlock(statements),
      //               }),
      //             ];
      //           })
      //         : processModel({
      //             client,
      //             meta: {
      //               $ref: `transformers/${name}`,
      //               name,
      //             },
      //             model: successResponses[0],
      //             path: [dataVariableName],
      //           });
      //     generateResponseTransformer({
      //       async: true,
      //       client,
      //       name: nameCreated,
      //       statements,
      //     });
      //   },
      //   type: `(${dataVariableName}: any) => Promise<${name}>`,
      // });
    }
  }
};
