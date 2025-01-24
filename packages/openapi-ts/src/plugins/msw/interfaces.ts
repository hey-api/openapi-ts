import ts from 'typescript';

import { compiler } from '../../compiler';

const objectReference = compiler.typeReferenceNode({ typeName: 'object' });
const tReference = compiler.typeReferenceNode({ typeName: 'T' });
const uReference = compiler.typeReferenceNode({ typeName: 'U' });
export const undefinedReference = compiler.typeReferenceNode({
  typeName: 'undefined',
});
export const neverReference = compiler.typeReferenceNode({ typeName: 'never' });

export const pathParamsTypeName = 'PathParams';
export const responseBodyTypeTypeName = 'ResponseBodyType';
const transformObjectTypeName = 'TransformObject';

export const createTransformObjectType = () => {
  const tkType = compiler.indexedAccessTypeNode({
    indexType: compiler.typeReferenceNode({ typeName: 'K' }),
    objectType: tReference,
  });
  const nullType = compiler.literalTypeNode({ literal: compiler.null() });
  const type = compiler.typeAliasDeclaration({
    name: transformObjectTypeName,
    type: compiler.mappedTypeNode({
      type: ts.factory.createConditionalTypeNode(
        tkType,
        objectReference,
        compiler.typeReferenceNode({
          typeArguments: [tkType],
          typeName: transformObjectTypeName,
        }),
        compiler.typeUnionNode({
          types: [
            compiler.typeReferenceNode({ typeName: 'string' }),
            ts.factory.createConditionalTypeNode(
              nullType,
              tkType,
              undefinedReference,
              neverReference,
            ),
          ],
        }),
      ),
      typeParameter: compiler.typeParameterDeclaration({
        constraint: compiler.typeOperatorNode({
          operator: 'keyof',
          type: tReference,
        }),
        name: 'K',
      }),
    }),
    typeParameters: [
      compiler.typeParameterDeclaration({
        name: 'T',
      }),
    ],
  });
  return type;
};

export const createPathParamsType = () => {
  const type = compiler.typeAliasDeclaration({
    name: pathParamsTypeName,
    type: ts.factory.createConditionalTypeNode(
      tReference,
      ts.factory.createTypeLiteralNode([
        ts.factory.createPropertySignature(
          undefined,
          ts.factory.createIdentifier('path'),
          ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          ts.factory.createInferTypeNode(
            compiler.typeParameterDeclaration({
              name: 'U',
            }),
          ),
        ),
      ]),
      ts.factory.createConditionalTypeNode(
        uReference,
        objectReference,
        compiler.typeReferenceNode({
          typeArguments: [uReference],
          typeName: transformObjectTypeName,
        }),
        neverReference,
      ),
      neverReference,
    ),
    typeParameters: [
      compiler.typeParameterDeclaration({
        name: 'T',
      }),
    ],
  });
  return type;
};

export const createResponseBodyTypeType = () => {
  const type = compiler.typeAliasDeclaration({
    name: responseBodyTypeTypeName,
    type: ts.factory.createConditionalTypeNode(
      compiler.typeReferenceNode({ typeName: 'void' }),
      tReference,
      compiler.typeUnionNode({
        types: [
          compiler.typeReferenceNode({
            typeArguments: [
              tReference,
              compiler.keywordTypeNode({ keyword: 'void' }),
            ],
            typeName: 'Exclude',
          }),
          undefinedReference,
        ],
      }),
      tReference,
    ),
    typeParameters: [
      compiler.typeParameterDeclaration({
        name: 'T',
      }),
    ],
  });
  return type;
};
