import type { Model } from '../client/interfaces/Model';

/**
 * Set unique enum values for the model
 * @param model The model that is post-processed
 */
export const postProcessModelEnums = (model: Model): Model[] =>
    model.enums.filter((property, index, arr) => arr.findIndex(item => item.name === property.name) === index);
