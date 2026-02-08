import { HydricError } from '../errors/hydric-error.js';
import { HydricInvalidParamsError } from '../errors/hydric-invalid-params.error.js';
import { HydricNotFoundError } from '../errors/hydric-not-found.error.js';
import { HydricRateLimitError } from '../errors/hydric-rate-limit.error.js';
import { HydricUnauthorizedError } from '../errors/hydric-unauthorized.error.js';
import { components } from '../generated/api-types.js';

export async function fetchHydricApi<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  const result = await response.json();

  if (!response.ok) {
    const errorResponse = result as components['schemas']['ErrorResponse'];
    let error: Error = new HydricError(errorResponse.error.message);

    if (response.status === 404) {
      error = new HydricNotFoundError(errorResponse.error.message);
    }

    if (response.status === 401) {
      error = new HydricUnauthorizedError(errorResponse.error.message);
    }

    if (response.status === 429) {
      error = new HydricRateLimitError(errorResponse.error.metadata as components['schemas']['RateLimitMetadata']);
    }

    if (response.status === 400) {
      error = new HydricInvalidParamsError(errorResponse.error.message);
    }

    Error.captureStackTrace(error, fetchHydricApi);
    throw error;
  }

  const successResult = result as components['schemas']['SuccessResponse'];
  return successResult.data as T;
}
