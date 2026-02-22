export default function convertPathToPosix(filePath: string): string {
  // Extended-length paths on Windows should not be converted
  if (filePath.startsWith('\\\\?\\')) {
    return filePath;
  }

  return filePath.replaceAll('\\', '/');
}
