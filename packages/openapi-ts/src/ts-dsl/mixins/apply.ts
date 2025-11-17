/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export function mixin(
  target: Function,
  ...sources: ReadonlyArray<Function | [Function, { overrideRender?: boolean }]>
) {
  const targetProto = target.prototype;
  for (const src of sources) {
    const [source, options] = src instanceof Array ? src : [src];
    let resolvedSource = source;
    if (typeof source === 'function') {
      try {
        const candidate = source(target);
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
      if (key === '$render' && !options?.overrideRender) continue;
      Object.defineProperty(targetProto, key, descriptor);
    }
  }
}
