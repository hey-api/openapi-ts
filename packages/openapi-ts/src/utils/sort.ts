export function sort(a: string, b: string): number {
  const nameA = a.toLocaleLowerCase()
  const nameB = b.toLocaleLowerCase()
  return nameA.localeCompare(nameB, 'en')
}

export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return items.sort((a, b) => sort(a.name, b.name))
}
