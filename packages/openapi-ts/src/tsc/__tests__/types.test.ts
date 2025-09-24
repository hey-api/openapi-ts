import { describe, expect, it } from 'vitest';

import { createRegularExpressionLiteral } from '../types';

describe('createRegularExpressionLiteral', () => {
  it('should escape forward slashes in regex patterns', () => {
    const result = createRegularExpressionLiteral({
      text: '^data:image/svg\\+xml;base64,[A-Za-z0-9+/]+=*$',
    });

    expect(result.text).toBe(
      '/^data:image\\/svg\\+xml;base64,[A-Za-z0-9+\\/]+=*$/',
    );
  });

  it('should handle patterns without forward slashes', () => {
    const result = createRegularExpressionLiteral({
      text: '^[a-zA-Z0-9_]*$',
    });

    expect(result.text).toBe('/^[a-zA-Z0-9_]*$/');
  });

  it('should handle patterns that already have slashes at start and end', () => {
    const result = createRegularExpressionLiteral({
      text: '/^[a-zA-Z0-9_]*$/',
    });

    expect(result.text).toBe('/^[a-zA-Z0-9_]*$/');
  });

  it('should handle patterns with slashes at start/end and internal slashes', () => {
    const result = createRegularExpressionLiteral({
      text: '/^data:image/svg\\+xml;base64,[A-Za-z0-9+/]+=*$/',
    });

    expect(result.text).toBe(
      '/^data:image\\/svg\\+xml;base64,[A-Za-z0-9+\\/]+=*$/',
    );
  });

  it('should preserve flags', () => {
    const result = createRegularExpressionLiteral({
      flags: ['g', 'i'],
      text: '^[a-zA-Z]*$',
    });

    expect(result.text).toBe('/^[a-zA-Z]*$/gi');
  });

  it('should handle patterns with multiple forward slashes', () => {
    const result = createRegularExpressionLiteral({
      text: '^path/to/file/name$',
    });

    expect(result.text).toBe('/^path\\/to\\/file\\/name$/');
  });

  it('should handle empty pattern', () => {
    const result = createRegularExpressionLiteral({
      text: '',
    });

    expect(result.text).toBe('//');
  });

  it('should handle patterns with already correctly escaped slashes', () => {
    const result = createRegularExpressionLiteral({
      text: '^data:image\\/svg\\+xml;base64,[A-Za-z0-9+\\/]+=*$',
    });

    expect(result.text).toBe(
      '/^data:image\\/svg\\+xml;base64,[A-Za-z0-9+\\/]+=*$/',
    );
  });
});
