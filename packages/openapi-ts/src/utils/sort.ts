export function sort(a: string, b: string): number {
  const nameA = a.toLocaleLowerCase();
  const nameB = b.toLocaleLowerCase();
  return nameA.localeCompare(nameB, 'en');
}

export const sorterByName = <T extends { name: string }>(a: T, b: T) =>
  sort(a.name, b.name);

export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return items.sort(sorterByName);
}
