import type { Input } from '~/types/input';

import { heyApiRegistryBaseUrl, inputToHeyApiPath } from './heyApi';
import { inputToReadmePath } from './readme';
import { inputToScalarPath } from './scalar';

export const inputToApiRegistry = (
  input: Input & {
    path: string;
  },
) => {
  if (input.path.startsWith('readme:')) {
    Object.assign(input, inputToReadmePath(input.path));
    return;
  }

  if (input.path.startsWith('scalar:')) {
    Object.assign(input, inputToScalarPath(input.path));
    return;
  }

  if (input.path.startsWith('.')) {
    return;
  }

  if (input.path.startsWith(heyApiRegistryBaseUrl)) {
    input.path = input.path.slice(heyApiRegistryBaseUrl.length + 1);
    Object.assign(input, inputToHeyApiPath(input as Input & { path: string }));
    return;
  }

  const parts = input.path.split('/');
  if (parts.length === 2 && parts.filter(Boolean).length === 2) {
    Object.assign(input, inputToHeyApiPath(input as Input & { path: string }));
    return;
  }
};
