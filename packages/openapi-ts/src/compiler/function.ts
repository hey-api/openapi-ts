import ts from 'typescript';

export const createCallExpression = ({
  parameters,
  functionName,
}: {
  parameters: Array<string>;
  functionName: string;
}) => {
  const functionIdentifier = ts.factory.createIdentifier(functionName);
  const argumentsArray = parameters.map((parameter) =>
    ts.factory.createIdentifier(parameter),
  );

  const callExpression = ts.factory.createCallExpression(
    functionIdentifier,
    undefined,
    argumentsArray,
  );

  return callExpression;
};
