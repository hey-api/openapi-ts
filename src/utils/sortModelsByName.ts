import type { Model } from '../client/interfaces/Model';

export const sortModelsByName = (models: Model[]): Model[] =>
    models.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, 'en');
    });
