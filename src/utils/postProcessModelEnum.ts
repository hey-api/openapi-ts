import type { Model } from '../types/client';

/**
 * Set unique enum values for the model
 * @param model
 */
export const postProcessModelEnum = (model: Model) =>
    model.enum.filter((property, index, arr) => arr.findIndex(item => item.value === property.value) === index);
