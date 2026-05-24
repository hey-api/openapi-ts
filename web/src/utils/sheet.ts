export interface SheetOptions {
  /**
   * Fraction of sheet height that triggers dismiss on drag.
   * @default 0.25
   */
  dismissThreshold?: number;
  onClose?: () => void;
  onEscape?: (e: KeyboardEvent, close: () => void) => void;
  onOpen?: () => void;
}

export interface SheetController {
  close: () => void;
  open: () => void;
}

export function createSheet(
  sheet: HTMLElement,
  backdrop: HTMLElement,
  options: SheetOptions = {},
): SheetController {
  const { dismissThreshold = 0.25, onClose, onEscape, onOpen } = options;

  function open(): void {
    sheet.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    sheet.style.transform = '';
    onOpen?.();
  }

  function close(): void {
    sheet.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    sheet.style.transform = '';
    onClose?.();
  }

  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!sheet.classList.contains('open')) return;

    if (onEscape) {
      onEscape(e, close);
    } else {
      close();
    }
  });

  attachDragDismiss(sheet, close, dismissThreshold);

  return { close, open };
}

function attachDragDismiss(sheet: HTMLElement, close: () => void, threshold: number): void {
  let dragStartY = 0;
  let dragCurrentY = 0;
  let isDragging = false;

  sheet.addEventListener(
    'touchstart',
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;

      const handle = sheet.querySelector('.sheet-handle-area');
      const body = sheet.querySelector('.sheet-body');
      const target = e.target as Node;
      const bodyScrolled = ((body as HTMLElement)?.scrollTop ?? 0) > 0;

      if (body?.contains(target) && bodyScrolled) {
        isDragging = false;
        return;
      }

      if (handle?.contains(target) || body?.contains(target)) {
        dragStartY = touch.clientY;
        dragCurrentY = touch.clientY;
        isDragging = true;
      }
    },
    { passive: true },
  );

  sheet.addEventListener(
    'touchmove',
    (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      if (!touch) return;

      dragCurrentY = touch.clientY;
      const delta = Math.max(0, dragCurrentY - dragStartY);
      if (delta <= 0) return;

      e.preventDefault();
      sheet.style.transition = 'none';
      sheet.style.transform = `translateY(${delta}px)`;
    },
    { passive: false },
  );

  sheet.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;

    const delta = dragCurrentY - dragStartY;
    sheet.style.transition = '';

    if (delta > sheet.offsetHeight * threshold) {
      close();
    } else {
      sheet.style.transform = '';
    }
  });
}
