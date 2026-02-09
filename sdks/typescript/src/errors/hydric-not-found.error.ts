import { HydricError } from './hydric-error.js';

/**
 * Error thrown when the requested resource is not found.
 */
export class HydricNotFoundError extends HydricError {
  public override readonly name: string = 'HydricNotFoundError';

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, HydricNotFoundError.prototype);
  }
}
