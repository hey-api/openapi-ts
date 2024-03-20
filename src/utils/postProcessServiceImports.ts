import type { Service } from '../types/client';
import { sort } from './sort';
import { unique } from './unique';

/**
 * Set unique imports, sorted by name
 * @param service
 */
export const postProcessServiceImports = (service: Service): string[] => service.imports.filter(unique).sort(sort);
