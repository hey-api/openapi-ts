export function createSkipButton(
  btn: HTMLElement | null,
  getTarget: () => number | undefined,
): {
  destroy: () => void;
  setVisible: (visible: boolean) => void;
} {
  function setVisible(visible: boolean): void {
    if (btn) btn.classList.toggle('is-hidden', !visible);
  }

  if (!btn)
    return {
      destroy: () => {},
      setVisible,
    };

  function clickHandler() {
    const top = getTarget();
    if (top === undefined || Number.isNaN(top)) return;
    window.scrollTo({ behavior: 'smooth', top });
  }
  btn.addEventListener('click', clickHandler);

  return {
    destroy: () => btn.removeEventListener('click', clickHandler),
    setVisible,
  };
}
