export const canProcessRef = ($ref: string, regexp?: RegExp): boolean => {
  if (!regexp) {
    return true;
  }

  regexp.lastIndex = 0;
  return regexp.test($ref);
};
