import type { OperationError } from './OperationError';
import type { OperationParameters } from './OperationParameters';
import type { OperationResponse } from './OperationResponse';

export interface Operation extends OperationParameters {
    service: string;
    name: string;
    summary: string | null;
    description: string | null;
    deprecated: boolean;
    method: string;
    path: string;
    errors: OperationError[];
    results: OperationResponse[];
    responseHeader: string | null;
    responseHeaders: ReadonlyArray<string> | null;
}
