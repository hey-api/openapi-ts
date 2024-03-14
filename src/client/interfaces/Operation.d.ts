import type { OperationError } from './OperationError';
import type { OperationParameters } from './OperationParameters';
import type { OperationResponse } from './OperationResponse';

export interface Operation extends OperationParameters {
    deprecated: boolean;
    description: string | null;
    errors: OperationError[];
    method: string;
    /**
     * Method name. Methods contain the request logic.
     */
    name: string;
    path: string;
    responseHeader: string | null;
    responseHeaders: ReadonlyArray<string> | null;
    results: OperationResponse[];
    /**
     * Service name, might be without postfix. This will be used to name the
     * exported class.
     */
    service: string;
    summary: string | null;
}
