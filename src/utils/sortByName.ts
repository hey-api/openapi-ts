export function sortByName<T extends { name: string }>(items: T[]): T[] {
    return items.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}
