import { ConfigError, getInput } from '@hey-api/shared';

import type { Job } from './expand';
import { getOutput } from './output/config';

export type ValidationResult = {
  errors: Array<ConfigError>;
  job: Job;
};

export function validateJobs(
  jobs: ReadonlyArray<Job>,
): ReadonlyArray<ValidationResult> {
  return jobs.map((job) => {
    const errors: Array<ConfigError> = [];
    const { config } = job;

    const inputs = getInput(config);
    if (!inputs.length) {
      errors.push(
        new ConfigError(
          'missing input - which OpenAPI specification should we use to generate your output?',
        ),
      );
    }

    const output = getOutput(config);
    if (!output.path) {
      errors.push(
        new ConfigError(
          'missing output - where should we generate your output?',
        ),
      );
    }

    return { errors, job };
  });
}
