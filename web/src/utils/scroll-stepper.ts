export interface ScrollStepperOptions {
  dwellVh: number;
  onStep: (index: number) => void;
  outer: HTMLElement;
  preDwellVh?: number;
  startStep?: number;
  stepCount: number;
}

export interface ScrollStepper {
  destroy: () => void;
  dwell: () => number;
  scrollPastEnd: () => void;
  scrollToStep: (index: number) => void;
}

export function scrollerHeight(
  stepCount: number,
  dwellVh: number,
  preDwellVh = 0,
  tailVh = 0,
): string {
  return `calc(100vh + ${stepCount * dwellVh + preDwellVh + tailVh}vh)`;
}

export function createScrollStepper({
  dwellVh,
  onStep,
  outer,
  preDwellVh = 0,
  startStep = 0,
  stepCount,
}: ScrollStepperOptions): ScrollStepper {
  function dwell() {
    return (window.innerHeight * dwellVh) / 100;
  }

  function preDwell() {
    return (window.innerHeight * preDwellVh) / 100;
  }

  let active = -1;

  function activate(index: number) {
    if (index === active) return;
    active = index;
    onStep(index);
  }

  function tick() {
    const scrolledIn = -outer.getBoundingClientRect().top;
    if (scrolledIn <= preDwell()) return activate(startStep);
    activate(Math.min(Math.floor((scrolledIn - preDwell()) / dwell()), stepCount - 1));
  }

  window.addEventListener('scroll', tick, { passive: true });
  tick();

  return {
    destroy() {
      window.removeEventListener('scroll', tick);
    },
    dwell,
    scrollPastEnd() {
      window.scrollTo({ behavior: 'smooth', top: outer.offsetTop + outer.offsetHeight });
    },
    scrollToStep(i) {
      window.scrollTo({
        top: Math.ceil(
          outer.getBoundingClientRect().top + window.scrollY + preDwell() + i * dwell(),
        ),
      });
    },
  };
}

export function getNextSection(current: HTMLElement | null): HTMLElement | null {
  let nextSection = current?.nextElementSibling as HTMLElement | null;
  while (nextSection?.tagName === 'SCRIPT') {
    nextSection = nextSection.nextElementSibling as HTMLElement | null;
  }
  return nextSection;
}
