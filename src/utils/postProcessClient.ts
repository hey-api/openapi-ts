import type { Client } from '../types/client';
import { postProcessModel } from './postProcessModel';
import { postProcessService } from './postProcessService';

/**
 * Post process client
 * @param client Client object with all the models, services, etc.
 */
export const postProcessClient = (client: Client): Client => ({
    ...client,
    models: client.models.map(model => postProcessModel(model)),
    services: client.services.map(service => postProcessService(service)),
});
