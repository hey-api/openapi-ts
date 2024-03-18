export function sortByName<T extends { name: string }>(items: T[]): T[] {
    return items.sort((a, b) => {
        const nameA = a.name.toLocaleLowerCase();
        const nameB = b.name.toLocaleLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}
