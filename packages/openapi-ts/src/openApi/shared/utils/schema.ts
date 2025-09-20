export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
