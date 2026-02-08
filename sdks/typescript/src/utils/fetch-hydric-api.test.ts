import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HydricError } from '../errors/hydric-error.js';
import { HydricNotFoundError } from '../errors/hydric-not-found.error.js';
import { HydricRateLimitError } from '../errors/hydric-rate-limit.error.js';
import { HydricUnauthorizedError } from '../errors/hydric-unauthorized.error.js';

import { fetchHydricApi } from './fetch-hydric-api.js';

describe('fetchHydricApi', () => {
  const url = 'https://api.hydric.org/v1/test';

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should return data for successful response', async () => {
    const mockData = { foo: 'bar' };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    } as Response);

    const result = await fetchHydricApi(url, {});
    expect(result).toEqual(mockData);
  });

  it('should throw HydricNotFoundError for 404', async () => {
    const mockError = {
      statusCode: 404,
      timestamp: '2026-01-01T00:00:00Z',
      path: '/v1/test',
      traceId: 'req_123',
      error: { code: 'TOKEN_NOT_FOUND', title: 'Not Found', message: 'Not found' },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => mockError,
    } as Response);

    await expect(fetchHydricApi(url, {})).rejects.toThrow(HydricNotFoundError);
  });

  it('should throw HydricUnauthorizedError for 401', async () => {
    const mockError = {
      statusCode: 401,
      timestamp: '2026-01-01T00:00:00Z',
      path: '/v1/test',
      traceId: 'req_123',
      error: { code: 'API_KEY_NOT_FOUND', title: 'Unauthorized', message: 'Unauthorized' },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => mockError,
    } as Response);

    await expect(fetchHydricApi(url, {})).rejects.toThrow(HydricUnauthorizedError);
  });

  it('should throw HydricRateLimitError for 429', async () => {
    const mockError = {
      statusCode: 429,
      timestamp: '2026-01-01T00:00:00Z',
      path: '/v1/test',
      traceId: 'req_123',
      error: { code: 'RATE_LIMIT_EXCEEDED', title: 'Too Many Requests', message: 'Slow down' },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => mockError,
    } as Response);

    await expect(fetchHydricApi(url, {})).rejects.toThrow(HydricRateLimitError);
  });

  it('should throw HydricApiError for other error status codes', async () => {
    const mockError = {
      statusCode: 500,
      timestamp: '2026-01-01T00:00:00Z',
      path: '/v1/test',
      traceId: 'req_123',
      error: { code: 'UNKNOWN_ERROR', title: 'Internal Error', message: 'Oops' },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => mockError,
    } as Response);

    await expect(fetchHydricApi(url, {})).rejects.toThrow(HydricError);
  });
});
