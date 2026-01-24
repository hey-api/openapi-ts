import { describe, expect, it } from 'vitest';

import { Logger } from '../logger';

describe('Logger', () => {
  describe('report', () => {
    it('should handle unended events gracefully', () => {
      const logger = new Logger();

      // Create an event but don't end it
      logger.timeEvent('test-event-1');

      // Create another event and end it
      const event2 = logger.timeEvent('test-event-2');
      event2.timeEnd();

      // report() should not throw even though event1 was never ended
      expect(() => logger.report(false)).not.toThrow();

      const measure = logger.report(false);
      expect(measure).toBeDefined();
      expect(measure?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle nested unended events', () => {
      const logger = new Logger();

      const parent = logger.timeEvent('parent');
      logger.timeEvent('child1');
      // Don't end child1

      const child2 = logger.timeEvent('child2');
      child2.timeEnd();

      parent.timeEnd();

      // report() should not throw even though child1 was never ended
      expect(() => logger.report(false)).not.toThrow();

      const measure = logger.report(false);
      expect(measure).toBeDefined();
    });

    it('should handle all events properly ended', () => {
      const logger = new Logger();

      const event1 = logger.timeEvent('event1');
      const event2 = logger.timeEvent('event2');

      event1.timeEnd();
      event2.timeEnd();

      expect(() => logger.report(false)).not.toThrow();

      const measure = logger.report(false);
      expect(measure).toBeDefined();
      expect(measure?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return undefined when no events exist', () => {
      const logger = new Logger();

      const measure = logger.report(false);
      expect(measure).toBeUndefined();
    });
  });
});
