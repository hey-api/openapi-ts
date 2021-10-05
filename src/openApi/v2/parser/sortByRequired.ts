import type { OperationParameter } from '../../../client/interfaces/OperationParameter';

export function sortByRequired(a: OperationParameter, b: OperationParameter): number {
    const aIsRequiredWithoutDefaultValue = a.isRequired && a.default === undefined;
    const bIsRequiredWithoutDefaultValue = b.isRequired && b.default === undefined;
    const aIsRequiredWithDefaultValue = a.isRequired && a.default !== undefined;
    const bIsRequiredWithDefaultValue = b.isRequired && b.default !== undefined;
    const aIsOptionalWithDefaultValue = !a.isRequired && a.default !== undefined;
    const bIsOptionalWithDefaultValue = !b.isRequired && b.default !== undefined;
    const aIsOptionalWithoutDefaultValue = !a.isRequired && a.default === undefined;
    const bIsOptionalWithoutDefaultValue = !b.isRequired && b.default === undefined;

    if (aIsRequiredWithoutDefaultValue && !bIsRequiredWithoutDefaultValue) return -1;
    if (bIsRequiredWithoutDefaultValue && !aIsRequiredWithoutDefaultValue) return 1;
    if (aIsRequiredWithDefaultValue && !bIsRequiredWithDefaultValue) return -1;
    if (bIsRequiredWithDefaultValue && !aIsRequiredWithDefaultValue) return 1;
    if (aIsOptionalWithDefaultValue && !bIsOptionalWithDefaultValue) return -1;
    if (bIsOptionalWithDefaultValue && !aIsOptionalWithDefaultValue) return 1;
    if (aIsOptionalWithoutDefaultValue && !bIsOptionalWithoutDefaultValue) return -1;
    if (bIsOptionalWithoutDefaultValue && !aIsOptionalWithoutDefaultValue) return 1;

    return 0;
}
