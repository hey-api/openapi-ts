import { preloadSound } from './sound';

interface CopyFeedbackOptions {
  delay?: number;
  onCopied?: () => void;
  onFailed?: () => void;
  onReset?: () => void;
}

export function createCopyFeedback({
  delay = 2000,
  onCopied,
  onFailed,
  onReset,
}: CopyFeedbackOptions) {
  const copySound = preloadSound('ui-copy');
  let timer: ReturnType<typeof setTimeout> | null = null;

  return async function trigger(copy: () => Promise<boolean>): Promise<void> {
    const success = await copy();
    if (success) {
      copySound.play();
      onCopied?.();
    } else {
      onFailed?.();
    }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      onReset?.();
      timer = null;
    }, delay);
  };
}
