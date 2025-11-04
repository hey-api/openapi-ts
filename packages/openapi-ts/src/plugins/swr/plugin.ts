import type { SwrPlugin } from './types';

export const handler: SwrPlugin['Handler'] = ({ plugin }) => {
  console.log(plugin.name);
};
