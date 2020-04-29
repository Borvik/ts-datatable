export function getLocalState<T>(key: string): T | null {
  if (!window || !window.localStorage) return null;

  try {
    let state = window.localStorage.getItem(key);
    if (state === null) return null;
    return JSON.parse(state);
  }
  catch {
    return null;
  }
}

export function saveLocalState(key: string, value: any): void {
  if (!window || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
  catch {}
}