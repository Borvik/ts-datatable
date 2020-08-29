type ClassName = string | null | undefined | Record<string, any>;

export function cx(...classNames: ClassName[]): string {
  return classNames.reduce<string[]>((results, cls) => {
    if (!cls) return results;

    if (typeof cls === 'string') {
      results.push(cls);
    } else {
      let keys = Object.keys(cls);
      for (let k of keys) {
        if (cls[k])
          results.push(k);
      }
    }
    return results;
  }, [])
  .join(' ');
}