export function closest(el: HTMLElement | null, selector: string): HTMLElement | null {
  if (!el) return null;
  if (typeof el.closest === 'function')
    return el.closest(selector);

  if (typeof el.matches === 'function') {
    let e: HTMLElement = el;
    do {
      if (e.matches(selector)) return e;
      e = e.parentElement || (e.parentNode as HTMLElement);
    } while (e !== null && e.nodeType === 1);
    return null;
  }

  throw new Error('"closest" not available');
}