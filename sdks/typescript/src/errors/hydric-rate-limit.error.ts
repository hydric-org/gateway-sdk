import { components } from '../generated/api-types.js';
import { HydricError } from './hydric-error.js';

/**
 * Error thrown when the rate limit of your API key is exceeded.
 */
export class HydricRateLimitError extends HydricError {
  public override readonly name = 'HydricRateLimitError';

  /**
   * The number of seconds to wait before retrying without exceeding the rate limit,
   */
  public readonly retryAfter?: number;

  constructor(metadata?: components['schemas']['RateLimitMetadata']) {
    const retryAfterSeconds = metadata?.retryAfterSeconds;
    const message = retryAfterSeconds
      ? `Too many requests. Your API key has exceeded its rate limit. Please try again in ${retryAfterSeconds} seconds.`
      : 'Too many requests. Your API key has exceeded its rate limit.';

    super(message);
    this.retryAfter = retryAfterSeconds;

    Object.setPrototypeOf(this, HydricRateLimitError.prototype);
  }
}
