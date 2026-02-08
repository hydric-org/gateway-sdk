import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HydricInvalidParamsError, HydricNotFoundError, HydricRateLimitError } from '../index.js';
import { MultiChainTokensResource } from './multi-chain-tokens-resource.js';

describe('TokensResource', () => {
  const baseUrl = 'https://api.hydric.org';
  const mockHeaders = {
    Authorization: 'Bearer sk_test_123',
    'Content-Type': 'application/json',
  };
  const getHeaders = vi.fn().mockReturnValue(mockHeaders);
  let tokens: MultiChainTokensResource;

  beforeEach(() => {
    tokens = new MultiChainTokensResource(baseUrl, getHeaders);
    vi.stubGlobal('fetch', vi.fn());
    getHeaders.mockClear();
  });

  describe('multichainList', () => {
    it('should fetch tokens correctly with successful response', async () => {
      const mockData = { tokens: [], nextCursor: null };
      const mockEnvelope = {
        statusCode: 200,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens',
        traceId: 'req_123',
        data: mockData,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockEnvelope,
      } as Response);

      const result = await tokens.list({ config: { limit: 10 } });

      expect(result).toEqual(mockData);
      expect(getHeaders).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/tokens`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({ config: { limit: 10 } }),
        }),
      );
    });

    it('should use default empty params if none provided', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { tokens: [] } }),
      } as Response);

      await tokens.list();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({}),
        }),
      );
    });

    it('should throw HydricNotFoundError on 404', async () => {
      const mockError = {
        statusCode: 404,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens',
        traceId: 'req_123',
        error: {
          code: 'TOKEN_NOT_FOUND',
          title: 'Not Found',
          message: 'Token not found',
        },
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockError,
      } as Response);

      try {
        await tokens.list();
      } catch (error) {
        expect(error).toBeInstanceOf(HydricNotFoundError);
        expect((error as any).name).toBe('HydricNotFoundError');
      }
    });

    it('should throw HydricRateLimitError on 429 and expose retryAfterSeconds', async () => {
      const mockError = {
        statusCode: 429,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens',
        traceId: 'req_123',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Too Many Requests',
          message: 'Slow down',
          metadata: { retryAfterSeconds: 60 },
        },
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => mockError,
      } as Response);

      try {
        await tokens.list();
        expect.fail('Should have thrown HydricRateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricRateLimitError);
        const rateLimitErr = error as HydricRateLimitError;
        expect(rateLimitErr.retryAfter).toBe(60);
        expect(rateLimitErr.name).toBe('HydricRateLimitError');
      }
    });

    it('should return undefined retryAfterSeconds if metadata is missing', async () => {
      const mockError = {
        statusCode: 429,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens',
        traceId: 'req_123',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Too Many Requests',
          message: 'Slow down',
        },
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => mockError,
      } as Response);

      try {
        await tokens.list();
      } catch (error) {
        const rateLimitErr = error as HydricRateLimitError;
        expect(rateLimitErr.retryAfter).toBeUndefined();
      }
    });

    it('should throw HydricApiError on other error responses (e.g. 400)', async () => {
      const mockError = {
        statusCode: 400,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens',
        traceId: 'req_123',
        error: {
          code: 'VALIDATION_ERROR',
          title: 'Bad Request',
          message: 'Invalid limit',
          details: 'Limit must be positive',
        },
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      try {
        await tokens.list();
      } catch (error) {
        expect(error).toBeInstanceOf(HydricInvalidParamsError);
        const apiErr = error as HydricInvalidParamsError;
        expect(apiErr.name).toBe('HydricInvalidParamsError');
      }
    });
  });
});
