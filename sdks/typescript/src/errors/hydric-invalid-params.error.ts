import { HydricError } from './hydric-error.js';

/**
 * Error thrown when the parameters provided to a method or class are invalid.
 */
export class HydricInvalidParamsError extends HydricError {
  public override readonly name = 'HydricInvalidParamsError';

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, HydricInvalidParamsError.prototype);
  }
}
