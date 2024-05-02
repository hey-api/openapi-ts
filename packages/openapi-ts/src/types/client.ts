import { Model, Service } from '../openApi';

export interface Client {
  // holds unique enum names to avoid duplicate type exports
  enumNames: string[];
  models: Model[];
  server: string;
  services: Service[];
  // holds unique service type names to avoid duplicate type exports
  serviceTypes: string[];
  version: string;
}
