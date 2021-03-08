const focusableItems = ['button', '[href]', 'input', 'select', 'textarea', '[tabindex]'].map(f => `${f}:not([tabindex="-1"]):not([data-noautofocus])`).join(', ');
export function firstFocusable(el: Element): HTMLElement | null {
  let autofocus = el.querySelector('[autofocus], .autofocus');
  if (autofocus) return autofocus as HTMLElement;

  let focusable = el.querySelector(focusableItems);
  if (!focusable) return null;
  return focusable as HTMLElement;
}