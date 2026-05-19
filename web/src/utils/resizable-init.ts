export function createResizableInit(init: () => (() => void) | void) {
  let activeCleanup: (() => void) | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  function run() {
    activeCleanup?.();
    activeCleanup = init() ?? null;
  }

  function onResize() {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeTimer = null;
      run();
    }, 150);
  }

  function setup() {
    window.addEventListener('resize', onResize);
    run();
  }

  function destroy() {
    if (resizeTimer !== null) {
      clearTimeout(resizeTimer);
      resizeTimer = null;
    }
    activeCleanup?.();
    activeCleanup = null;
    window.removeEventListener('resize', onResize);
  }

  return { destroy, setup };
}
