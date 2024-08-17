import type { OpenApiContact } from './OpenApiContact';
import type { OpenApiLicense } from './OpenApiLicense';

/**
 * {@link} https://github.com/OAI/OpenAPI-Specification/blob/main/versions/2.0.md#info-object
 */
export interface OpenApiInfo {
  contact?: OpenApiContact;
  description?: string;
  license?: OpenApiLicense;
  termsOfService?: string;
  title: string;
  version: string;
}
