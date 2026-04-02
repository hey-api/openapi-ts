import type { IR } from '../ir/types';
import type { PluginInstance } from './shared/utils/instance';

/**
 * Configuration for a single validator layer (e.g. body, headers, path, query).
 */
export interface RequestValidatorLayer {
  /**
   * Output property name in the composite schema.
   *
   * @default Same as the layer name ('body', 'path', 'query')
   */
  as?: string;
  /**
   * Wrap the layer schema in an optional modifier.
   *
   * @default true
   */
  optional?: boolean;
  /**
   * Behavior when this layer has no schema defined.
   *
   * Can be:
   * - `'strict'` — Generate a schema that rejects any value
   * - `'passthrough'` — Generate a schema that accepts any object
   * - `'omit'` — Exclude this property from the composite shape
   *
   * @default 'strict'
   */
  whenEmpty?: 'strict' | 'passthrough' | 'omit';
}

/**
 * A {@link RequestValidatorLayer} with all optional properties resolved to their required form.
 */
export type ResolvedRequestValidatorLayer = Required<RequestValidatorLayer>;

/**
 * A map from a set of layer keys to optional layer configuration objects.
 *
 * @template Keys - The union of layer key names.
 * @template Layer - The shape of an individual layer configuration.
 */
export type ValidatorLayers<Keys extends PropertyKey, Layer extends object> = {
  [K in Keys]?: Layer;
};

/**
 * A map from a set of layer keys to fully-resolved (required) layer configuration objects.
 * Represents the default fallback values used when a layer is not explicitly configured.
 *
 * @template Keys - The union of layer key names.
 * @template Layer - The shape of an individual layer configuration.
 */
export type DefaultValidatorLayers<Keys extends PropertyKey, Layer extends object> = {
  [K in Keys]: Required<Layer>;
};

/**
 * The ordered list of standard HTTP request layer keys.
 */
export const requestValidatorLayers = ['body', 'headers', 'path', 'query'] as const;

/**
 * Optional per-layer configuration for the standard HTTP request layers
 * (body, headers, path, query).
 */
export type RequestValidatorLayers = ValidatorLayers<
  (typeof requestValidatorLayers)[number],
  RequestValidatorLayer
>;

/**
 * Required default configuration for all standard HTTP request layers
 * (body, headers, path, query).
 */
export type DefaultRequestValidatorLayers = DefaultValidatorLayers<
  (typeof requestValidatorLayers)[number],
  RequestValidatorLayer
>;

/**
 * Context passed to request schema helpers.
 *
 * @template Plugin - The plugin instance type.
 */
export interface RequestSchemaContext<Plugin extends PluginInstance = PluginInstance> {
  /**
   * Per-layer configuration. Omitted layers use defaults.
   *
   * @default { body: {}, headers: {}, path: {}, query: {} }
   */
  layers?: RequestValidatorLayers;
  /** The operation object. */
  operation: IR.OperationObject;
  /** The plugin instance. */
  plugin: Plugin;
}

/**
 * Resolves the effective configuration for a single layer by merging the
 * layer's defaults with any explicit overrides supplied in `layers`.
 *
 * @param layers - Optional map of per-layer overrides.
 * @param key - The layer key to resolve.
 * @param defaultValues - Required fallback values for every layer key.
 * @returns The fully-resolved layer configuration.
 */
export function resolveValidatorLayer<
  Layers extends Record<PropertyKey, object | undefined>,
  Key extends keyof Layers,
>(
  layers: Layers | undefined,
  key: Key,
  defaultValues: { [K in keyof Layers]-?: Required<NonNullable<Layers[K]>> },
): Required<NonNullable<Layers[Key]>> {
  const override = Object.fromEntries(
    Object.entries(layers?.[key] ?? {}).filter(([, v]) => v !== undefined),
  );
  return { ...defaultValues[key], ...override };
}
