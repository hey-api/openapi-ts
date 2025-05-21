import type { AsyncDataRequestStatus } from 'nuxt/app';
import type { Ref } from 'vue';

/**
 * Wait for the status to change from 'pending' to a non-pending value.
 * @param status - The status to wait for.
 * @returns A promise that resolves when the status is no longer 'pending'.
 */
export const waitStatusFinished = (
  status: Ref<AsyncDataRequestStatus>,
): Promise<void> =>
  // sleep 50ms initially, see if status is no longer 'pending', sleep 100ms
  // in a loop until it is. if more than 5s has passed, throw an error.
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (status.value !== 'pending') {
        resolve();
        return;
      }

      const interval = setInterval(() => {
        if (status.value !== 'pending') {
          clearInterval(interval);
          resolve();
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        reject(
          new Error('Timed out waiting for status to change from "pending"'),
        );
      }, 5000);
    }, 50);
  });
