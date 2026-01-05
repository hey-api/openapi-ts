import type { Casing, NameTransformer } from '~/utils/naming';

export type FeatureToggle = {
  /**
   * Whether this feature is enabled.
   */
  enabled: boolean;
};

export type IndexExportOption = {
  /**
   * Whether exports should be re-exported in the index file.
   */
  exportFromIndex: boolean;
};

export type NamingOptions = {
  /**
   * Casing convention for generated names.
   */
  case: Casing;
  /**
   * Naming pattern for generated names.
   */
  name: NameTransformer;
};
