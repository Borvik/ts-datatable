export function getScrollParent(el: Element, includeHidden: boolean = false) {
  let style = window.getComputedStyle(el);
  let excludeStaticParent = style.position === "absolute";
  let overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/;

  if (style.position === "fixed") return document.body;
  for (let parent: Element | null = el; (parent = parent.parentElement);) {
    style = getComputedStyle(parent);
    if (excludeStaticParent && style.position === "static") {
      continue;
    }
    if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)) {
      return parent;
    }
  }

  return document.body;
}