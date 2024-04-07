import { Model, OperationParameter } from '../openApi';
import { Config } from '../types/config';

export const getDefaultPrintable = (p: OperationParameter | Model): string | undefined => {
    if (p.default === undefined) {
        return undefined;
    }
    return JSON.stringify(p.default, null, 4);
};

export const modelIsRequired = (config: Config, model: Model) => {
    if (config?.useOptions) {
        return model.isRequired ? '' : '?';
    }
    return !model.isRequired && !getDefaultPrintable(model) ? '?' : '';
};
