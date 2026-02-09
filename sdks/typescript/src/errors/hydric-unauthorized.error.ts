import { HydricError } from './hydric-error.js';

/**
 * Error thrown when the provided API key is invalid or does not exist.
 */
export class HydricUnauthorizedError extends HydricError {
  public override readonly name: string = 'HydricUnauthorizedError';

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, HydricUnauthorizedError.prototype);
  }
}
