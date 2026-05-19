export interface HoverDropdownOptions {
  onClose?: () => void;
  onOpen?: () => void;
  openClass?: string;
  panel: HTMLElement;
  trigger: HTMLElement;
  wrapper: HTMLElement;
}

export function createHoverDropdown({
  onClose,
  onOpen,
  openClass = 'open',
  panel,
  trigger,
  wrapper,
}: HoverDropdownOptions) {
  let pinned = false;

  function open() {
    panel.classList.add(openClass);
    trigger.setAttribute('aria-expanded', 'true');
    onOpen?.();
  }

  function close() {
    panel.classList.remove(openClass);
    trigger.setAttribute('aria-expanded', 'false');
    onClose?.();
  }

  wrapper.addEventListener('mouseenter', open);
  wrapper.addEventListener('mouseleave', () => {
    if (!pinned) close();
  });

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    pinned = !pinned;
    return pinned ? open() : close();
  });

  const onDocClick = (e: MouseEvent) => {
    if (!wrapper.contains(e.target as Node)) {
      pinned = false;
      close();
    }
  };

  const onEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && pinned) {
      pinned = false;
      close();
    }
  };

  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onEscape);

  return {
    close() {
      pinned = false;
      close();
    },
    destroy() {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEscape);
    },
  };
}
