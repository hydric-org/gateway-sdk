import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HydricInvalidParamsError, HydricRateLimitError } from '../index.js';
import { SingleChainTokensResource } from './single-chain-tokens-resource.js';

describe('SingleChainTokensResource', () => {
  const baseUrl = 'https://api.hydric.org';
  const mockHeaders = {
    Authorization: 'Bearer sk_test_123',
    'Content-Type': 'application/json',
  };
  const getHeaders = vi.fn().mockReturnValue(mockHeaders);
  let tokens: SingleChainTokensResource;

  beforeEach(() => {
    tokens = new SingleChainTokensResource(baseUrl, getHeaders);
    vi.stubGlobal('fetch', vi.fn());
    getHeaders.mockClear();
  });

  describe('list', () => {
    it('should fetch tokens correctly with successful response', async () => {
      const mockData = { tokens: [], nextCursor: null };
      const mockEnvelope = {
        statusCode: 200,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/8453',
        traceId: 'req_123',
        data: mockData,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockEnvelope,
      } as Response);

      const result = await tokens.list(8453, { config: { limit: 10 } });

      expect(result).toEqual(mockData);
      expect(getHeaders).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/tokens/8453`,
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

      await tokens.list(1);

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/tokens/1`,
        expect.objectContaining({
          body: JSON.stringify({}),
        }),
      );
    });

    it('should throw HydricInvalidParamsError on unsupported chainId', async () => {
      const mockError = {
        statusCode: 400,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/999999',
        traceId: 'req_123',
        error: {
          code: 'UNSUPPORTED_CHAIN_ID',
          title: 'Invalid Parameters',
          message: 'Unsupported Chain ID: 999999',
          details: 'The provided ID is not supported.',
          metadata: {
            chainId: 999999,
            unsupportedIds: [999999],
            supportedIds: [1, 143, 130, 999, 8453, 9745, 534352],
          },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      try {
        await tokens.list(999999 as unknown as 1);
        expect.fail('Should have thrown HydricInvalidParamsError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricInvalidParamsError);
        expect((error as HydricInvalidParamsError).name).toBe('HydricInvalidParamsError');
      }
    });

    it('should throw HydricRateLimitError on 429', async () => {
      const mockError = {
        statusCode: 429,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/1',
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
        await tokens.list(1);
        expect.fail('Should have thrown HydricRateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricRateLimitError);
        expect((error as HydricRateLimitError).retryAfter).toBe(60);
      }
    });
  });

  describe('search', () => {
    it('should search tokens by keyword successfully', async () => {
      const mockData = {
        tokens: [
          {
            chainId: 8453,
            address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
            decimals: 6,
            name: 'USD Coin',
            symbol: 'USDC',
            logoUrl: 'https://logos.hydric.org/tokens/8453/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
          },
        ],
        nextCursor: null,
        filters: {},
      };
      const mockEnvelope = {
        statusCode: 200,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/8453/search',
        traceId: 'req_456',
        data: mockData,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockEnvelope,
      } as Response);

      const result = await tokens.search(8453, { search: 'USDC' });

      expect(result).toEqual(mockData);
      expect(getHeaders).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/tokens/8453/search`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({ search: 'USDC' }),
        }),
      );
    });

    it('should pass config and filters to the API', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { tokens: [], filters: {} } }),
      } as Response);

      await tokens.search(1, {
        search: 'ETH',
        config: { limit: 5 },
        filters: { minimumTotalValuePooledUsd: 10000 },
      });

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/tokens/1/search`,
        expect.objectContaining({
          body: JSON.stringify({
            search: 'ETH',
            config: { limit: 5 },
            filters: { minimumTotalValuePooledUsd: 10000 },
          }),
        }),
      );
    });

    it('should throw HydricInvalidParamsError on 400 validation error', async () => {
      const mockError = {
        statusCode: 400,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/8453/search',
        traceId: 'req_789',
        error: {
          code: 'VALIDATION_ERROR',
          title: 'Invalid Parameters',
          message: 'search must not be empty',
          details: "Check the 'meta' field for specific field-level violations.",
          metadata: {
            property: 'search',
            value: '',
            constraints: { isNotEmpty: ['search must not be empty'] },
          },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      try {
        await tokens.search(8453, { search: '' });
        expect.fail('Should have thrown HydricInvalidParamsError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricInvalidParamsError);
        expect((error as HydricInvalidParamsError).name).toBe('HydricInvalidParamsError');
      }
    });

    it('should throw HydricRateLimitError on 429', async () => {
      const mockError = {
        statusCode: 429,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/1/search',
        traceId: 'req_xyz',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Too Many Requests',
          message: 'Rate limit exceeded',
          metadata: { retryAfterSeconds: 30 },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => mockError,
      } as Response);

      try {
        await tokens.search(1, { search: 'BTC' });
        expect.fail('Should have thrown HydricRateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricRateLimitError);
        expect((error as HydricRateLimitError).retryAfter).toBe(30);
      }
    });
  });
});
