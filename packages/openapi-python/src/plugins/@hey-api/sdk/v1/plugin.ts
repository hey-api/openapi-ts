import type { HeyApiSdkPlugin } from '../types';

export const handlerV1: HeyApiSdkPlugin['Handler'] = ({ plugin }) => {
  console.log(plugin);
};
