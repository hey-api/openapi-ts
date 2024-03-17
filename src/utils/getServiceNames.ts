import type { Service } from '../client/interfaces/Service';
import { sort } from './sort';

export const getServiceNames = (services: Service[]): string[] => services.map(service => service.name).sort(sort);
