import type { Input } from '../../types/input';
import { heyApiRegistryBaseUrl, inputToHeyApiPath } from './heyApi';
import { inputToReadmePath } from './readme';
import { inputToScalarPath } from './scalar';

export const inputToApiRegistry = (
  input: Input & {
    path: string;
  },
) => {
  if (input.path.startsWith('readme:')) {
    input.path = inputToReadmePath(input.path);
    return;
  }

  if (input.path.startsWith('scalar:')) {
    input.path = inputToScalarPath(input.path);
    return;
  }

  if (input.path.startsWith('.')) {
    return;
  }

  if (input.path.startsWith(heyApiRegistryBaseUrl)) {
    input.path = input.path.slice(heyApiRegistryBaseUrl.length + 1);
    input.path = inputToHeyApiPath(input as Input & { path: string });
    return;
  }

  const parts = input.path.split('/');
  const cleanParts = parts.filter(Boolean);
  if (parts.length === 2 && cleanParts.length === 2) {
    input.path = inputToHeyApiPath(input as Input & { path: string });
  }
};
