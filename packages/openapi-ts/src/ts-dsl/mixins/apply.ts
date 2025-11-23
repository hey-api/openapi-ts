/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export function mixin(target: Function, ...sources: ReadonlyArray<Function>) {
  const targetProto = target.prototype;
  for (const src of sources) {
    let resolvedSource = src;
    if (typeof src === 'function') {
      try {
        const candidate = src(target);
        if (candidate?.prototype) {
          resolvedSource = candidate;
        }
      } catch {
        // noop
      }
    }
    const sourceProto = resolvedSource.prototype;
    if (!sourceProto) continue;
    for (const [key, descriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(sourceProto),
    )) {
      if (key === 'constructor') continue;
      Object.defineProperty(targetProto, key, descriptor);
    }
  }
}
