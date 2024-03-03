import type { OperationParameter } from './OperationParameter';

export interface OperationParameters {
    imports: string[];
    parameters: OperationParameter[];
    parametersBody: OperationParameter | null;
    parametersCookie: OperationParameter[];
    parametersForm: OperationParameter[];
    parametersHeader: OperationParameter[];
    parametersPath: OperationParameter[];
    parametersQuery: OperationParameter[];
}
