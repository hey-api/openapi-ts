export interface PresetPlugin {
  [key: string]: unknown;
  name: string;
}

export interface Preset {
  /** Plugin configurations contributed by this preset. */
  plugins?: ReadonlyArray<string | PresetPlugin>;
}
