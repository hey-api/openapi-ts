import { describe, expect, it } from 'vitest';

import { splitNameAndExtension } from '../file';

describe('splitNameAndExtension', () => {
  it('should split filename with extension correctly', () => {
    const result = splitNameAndExtension('document.pdf');
    expect(result).toEqual({ extension: 'pdf', name: 'document' });
  });

  it('should handle filename without extension', () => {
    const result = splitNameAndExtension('README');
    expect(result).toEqual({ extension: '', name: 'README' });
  });

  it('should handle filename with multiple dots', () => {
    const result = splitNameAndExtension('my.file.name.txt');
    expect(result).toEqual({ extension: 'txt', name: 'my.file.name' });
  });

  it('should handle empty string', () => {
    const result = splitNameAndExtension('');
    expect(result).toEqual({ extension: '', name: '' });
  });

  it('should handle filename with uppercase extension', () => {
    const result = splitNameAndExtension('image.PNG');
    expect(result).toEqual({ extension: 'PNG', name: 'image' });
  });

  it('should handle extension with numbers', () => {
    const result = splitNameAndExtension('video.mp4');
    expect(result).toEqual({ extension: 'mp4', name: 'video' });
  });
});
