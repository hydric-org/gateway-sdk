/**
 * Generic Hydric error used when the error is not of any other specific type.
 */
export class HydricError extends Error {
  public override readonly name: string = 'HydricError';
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, HydricError.prototype);
  }
}
