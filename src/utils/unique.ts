export const unique = <T>(value: T, index: number, arr: T[]): boolean => {
    return arr.indexOf(value) === index;
};
