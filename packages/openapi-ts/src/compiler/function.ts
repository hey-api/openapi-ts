import ts from 'typescript';

export const createCallExpression = ({
  parameters,
  functionName,
}: {
  parameters: Array<string>;
  functionName: string;
}) => {
  const functionIdentifier = ts.factory.createIdentifier(functionName);

  const callExpression = ts.factory.createCallExpression(
    functionIdentifier,
    undefined,
    parameters.map((parameter) => ts.factory.createIdentifier(parameter)),
  );

  return callExpression;
};
