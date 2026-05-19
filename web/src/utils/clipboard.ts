export async function writeText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export async function writeBlob(
  blob: Promise<Blob>,
  fallbackText: () => Promise<string>,
): Promise<boolean> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
      return true;
    } catch {
      // fall through
    }
  }

  try {
    return writeText(await fallbackText());
  } catch {
    return false;
  }
}
