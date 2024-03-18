import type { Model } from './Model';
import type { OperationParameter } from './OperationParameter';

export interface OperationParameters extends Pick<Model, '$refs' | 'imports'> {
    parameters: OperationParameter[];
    parametersBody: OperationParameter | null;
    parametersCookie: OperationParameter[];
    parametersForm: OperationParameter[];
    parametersHeader: OperationParameter[];
    parametersPath: OperationParameter[];
    parametersQuery: OperationParameter[];
}
