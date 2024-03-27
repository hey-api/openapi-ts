import { Model, Service } from '../openApi';
export interface Client {
    models: Model[];
    server: string;
    services: Service[];
    version: string;
}
