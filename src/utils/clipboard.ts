/**
 * Safe clipboard helper for web applications running over both HTTPS and HTTP (unsecure contexts)
 */

export async function safeReadClipboard(): Promise<string | null> {
  // 1. Try standard Async Clipboard API (works on HTTPS or localhost)
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        return text.trim();
      }
    }
  } catch (err) {
    // Expected on non-HTTPS origins (e.g. plain HTTP IP on mobile chrome)
  }

  return null;
}

export async function safeWriteClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Write clipboard failed, falling back to execCommand:', err);
  }

  // Fallback using textarea + execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}

