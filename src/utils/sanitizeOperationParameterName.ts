import sanitizeOperationName from './sanitizeOperationName';

const sanitizeOperationParameterName = (name: string): string => {
    const withoutBrackets = name.replace('[]', 'Array');
    return sanitizeOperationName(withoutBrackets);
};
export default sanitizeOperationParameterName;
