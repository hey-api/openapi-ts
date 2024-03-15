import type { Model } from '../client/interfaces/Model';

/**
 * Set unique enum values for the model
 * @param model
 */
export const postProcessModelEnum = (model: Model) => {
    return model.enum.filter((property, index, arr) => {
        return arr.findIndex(item => item.value === property.value) === index;
    });
};
