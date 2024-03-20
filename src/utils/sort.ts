export const sort = (a: string, b: string): number => {
    const nameA = a.toLowerCase();
    const nameB = b.toLowerCase();
    return nameA.localeCompare(nameB, 'en');
};

export function sortByName<T extends { name: string }>(items: T[]): T[] {
    return items.sort((a, b) => {
        const nameA = a.name.toLocaleLowerCase();
        const nameB = b.name.toLocaleLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
}
