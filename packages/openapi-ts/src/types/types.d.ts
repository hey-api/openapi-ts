import type { Operation } from './client';

export namespace LegacyIR {
  export type LegacyOperation = Operation;
}

export interface WatchValues {
  /**
   * Headers to be sent with each HEAD and/or GET request. This effectively
   * serves as a mechanism resolver because setting certain headers will opt
   * into comparing the specifications using that method.
   */
  headers: Headers;
  /**
   * Per-input watch state for multi-input mode. Keys should be a stable
   * identifier for the input (typically the URL or file path).
   */
  inputs?: Record<
    string,
    {
      headers: Headers;
      isHeadMethodSupported?: boolean;
      lastValue?: string;
    }
  >;
  /**
   * Can we send a HEAD request instead of fetching the whole specification?
   * This value will be set after the first successful fetch.
   */
  isHeadMethodSupported?: boolean;
  /**
   * String content of the last successfully fetched specification.
   */
  lastValue?: string;
}
