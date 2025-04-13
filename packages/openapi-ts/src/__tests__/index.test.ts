import { describe, expect, it } from 'vitest';

describe('main entry index', () => {
  describe('createClient', () => {
    it('should be exported', async () => {
      const { createClient } = await import('../index');
      expect(createClient).toBeDefined();
    });
  });
});
