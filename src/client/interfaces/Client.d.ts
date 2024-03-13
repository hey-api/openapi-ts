import type { Model } from './Model';
import type { Service } from './Service';

export interface Client {
    models: Model[];
    server: string;
    services: Service[];
    version: string;
}
