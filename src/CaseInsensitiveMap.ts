/**
 * https://stackoverflow.com/a/50022230/14894786
 * licensed under CC BY-SA 4.0
 * changes: add overrides, remove "as any", remove empty lines
 */
export class CaseInsensitiveMap<T, U> extends Map<T, U> {
  override get(key: T): U | undefined {
    if (typeof key === 'string') {
      key = key.toLowerCase() as T;
    }
    return super.get(key);
  }

  override has(key: T): boolean {
    if (typeof key === 'string') {
      key = key.toLowerCase() as T;
    }
    return super.has(key);
  }

  override set(key: T, value: U): this {
    if (typeof key === 'string') {
      key = key.toLowerCase() as T;
    }
    return super.set(key, value);
  }
}