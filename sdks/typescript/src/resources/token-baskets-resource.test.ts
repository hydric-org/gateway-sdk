import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HydricInvalidParamsError, HydricNotFoundError, HydricRateLimitError } from '../index.js';
import { TokenBasketsResource } from './token-baskets-resource.js';

describe('TokenBasketsResource', () => {
  const baseUrl = 'https://api.hydric.org';
  const mockHeaders = {
    Authorization: 'Bearer sk_test_123',
    'Content-Type': 'application/json',
  };
  const getHeaders = vi.fn().mockReturnValue(mockHeaders);
  let baskets: TokenBasketsResource;

  beforeEach(() => {
    baskets = new TokenBasketsResource(baseUrl, getHeaders);
    vi.stubGlobal('fetch', vi.fn());
    getHeaders.mockClear();
  });

  describe('list', () => {
    it('should fetch all baskets with GET request', async () => {
      const mockData = {
        baskets: [
          {
            id: 'usd-stablecoins',
            name: 'USD Stablecoins',
            description: 'A basket of the most liquid USD stablecoins',
            logoUrl: 'https://cdn.example.com/baskets/usd.png',
            chainIds: [1, 8453],
            addresses: [
              { chainId: 1, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
              { chainId: 8453, address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' },
            ],
            tokens: [],
          },
        ],
      };
      const mockEnvelope = {
        statusCode: 200,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets',
        traceId: 'req_123',
        data: mockData,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockEnvelope,
      } as Response);

      const result = await baskets.list();

      expect(result).toEqual(mockData);
      expect(getHeaders).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/tokens/baskets`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        }),
      );
    });

    it('should include chainIds query parameter when provided', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { baskets: [] } }),
      } as Response);

      await baskets.list({ chainIds: [1, 8453] });

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/v1/tokens/baskets?chainIds=1&chainIds=8453`, expect.any(Object));
    });

    it('should throw HydricRateLimitError on 429', async () => {
      const mockError = {
        statusCode: 429,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets',
        traceId: 'req_123',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Too Many Requests',
          message: 'Rate limit exceeded',
          metadata: { retryAfterSeconds: 60 },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => mockError,
      } as Response);

      try {
        await baskets.list();
        expect.fail('Should have thrown HydricRateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricRateLimitError);
        expect((error as HydricRateLimitError).retryAfter).toBe(60);
      }
    });
  });

  describe('get', () => {
    it('should fetch a specific basket by ID', async () => {
      const mockData = {
        basket: {
          id: 'usd-stablecoins',
          name: 'USD Stablecoins',
          description: 'A basket of the most liquid USD stablecoins',
          logoUrl: 'https://cdn.example.com/baskets/usd.png',
          chainIds: [1, 8453],
          addresses: [{ chainId: 1, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }],
          tokens: [],
        },
      };
      const mockEnvelope = {
        statusCode: 200,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets/usd-stablecoins',
        traceId: 'req_456',
        data: mockData,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockEnvelope,
      } as Response);

      const result = await baskets.getMultiChainById({ basketId: 'usd-stablecoins' });

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/tokens/baskets/usd-stablecoins`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        }),
      );
    });

    it('should include chainIds query parameter when provided', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { basket: {} } }),
      } as Response);

      await baskets.getMultiChainById({ basketId: 'eth-pegged-tokens', chainIds: [1] });

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/v1/tokens/baskets/eth-pegged-tokens?chainIds=1`, expect.any(Object));
    });

    it('should throw HydricInvalidParamsError on invalid basket ID', async () => {
      const mockError = {
        statusCode: 400,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets/invalid-id',
        traceId: 'req_789',
        error: {
          code: 'INVALID_BASKET_ID',
          title: 'Invalid Parameters',
          message: 'Invalid Basket ID: invalid-id',
          details: 'The provided ID is not supported.',
          metadata: {
            basketId: 'invalid-id',
            supportedIds: ['usd-stablecoins', 'eth-pegged-tokens'],
          },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockError,
      } as Response);

      try {
        await baskets.getMultiChainById({ basketId: 'invalid-id' as unknown as 'usd-stablecoins' });
        expect.fail('Should have thrown HydricInvalidParamsError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricInvalidParamsError);
        expect((error as HydricInvalidParamsError).name).toBe('HydricInvalidParamsError');
      }
    });

    it('should throw HydricNotFoundError when basket has no assets on chain', async () => {
      const mockError = {
        statusCode: 404,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets/monad-pegged-tokens',
        traceId: 'req_abc',
        error: {
          code: 'TOKEN_BASKET_NOT_FOUND',
          title: 'Not Found',
          message: "Couldn't find the token basket 'monad-pegged-tokens' on any supported network",
          details: 'The requested token basket does not exist or has no assets on the specified network.',
          metadata: { basketId: 'monad-pegged-tokens' },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockError,
      } as Response);

      try {
        await baskets.getMultiChainById({ basketId: 'monad-pegged-tokens', chainIds: [1] });
        expect.fail('Should have thrown HydricNotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricNotFoundError);
      }
    });

    it('should throw HydricRateLimitError on 429', async () => {
      const mockError = {
        statusCode: 429,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets/usd-stablecoins',
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
        await baskets.getMultiChainById({ basketId: 'usd-stablecoins' });
        expect.fail('Should have thrown HydricRateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricRateLimitError);
        expect((error as HydricRateLimitError).retryAfter).toBe(30);
      }
    });
  });

  describe('getByChain', () => {
    it('should fetch a basket for a specific chain', async () => {
      const mockData = {
        basket: {
          id: 'usd-stablecoins',
          name: 'USD Stablecoins',
          description: 'A basket of the most liquid USD stablecoins',
          logoUrl: 'https://cdn.example.com/baskets/usd.png',
          chainIds: [8453],
          addresses: [{ chainId: 8453, address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' }],
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
        },
      };
      const mockEnvelope = {
        statusCode: 200,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets/8453/usd-stablecoins',
        traceId: 'req_chain',
        data: mockData,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockEnvelope,
      } as Response);

      const result = await baskets.getSingleChainById({
        chainId: 8453,
        basketId: 'usd-stablecoins',
      });

      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/v1/tokens/baskets/8453/usd-stablecoins`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        }),
      );
    });

    it('should throw HydricInvalidParamsError on unsupported chainId', async () => {
      const mockError = {
        statusCode: 400,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets/999999/usd-stablecoins',
        traceId: 'req_bad_chain',
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
        await baskets.getSingleChainById({ chainId: 999999 as unknown as 1, basketId: 'usd-stablecoins' });
        expect.fail('Should have thrown HydricInvalidParamsError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricInvalidParamsError);
      }
    });

    it('should throw HydricNotFoundError when basket not found on chain', async () => {
      const mockError = {
        statusCode: 404,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets/1/monad-pegged-tokens',
        traceId: 'req_not_found',
        error: {
          code: 'TOKEN_BASKET_NOT_FOUND',
          title: 'Not Found',
          message: "Couldn't find the token basket 'monad-pegged-tokens' on chain id 1",
          details: 'The requested token basket does not exist or has no assets on the specified network.',
          metadata: { basketId: 'monad-pegged-tokens', chainId: 1 },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => mockError,
      } as Response);

      try {
        await baskets.getSingleChainById({ chainId: 1, basketId: 'monad-pegged-tokens' });
        expect.fail('Should have thrown HydricNotFoundError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricNotFoundError);
      }
    });

    it('should throw HydricRateLimitError on 429', async () => {
      const mockError = {
        statusCode: 429,
        timestamp: '2026-01-01T00:00:00Z',
        path: '/v1/tokens/baskets/1/usd-stablecoins',
        traceId: 'req_rate',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          title: 'Too Many Requests',
          message: 'Rate limit exceeded',
          metadata: { retryAfterSeconds: 45 },
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => mockError,
      } as Response);

      try {
        await baskets.getSingleChainById({ chainId: 1, basketId: 'usd-stablecoins' });
        expect.fail('Should have thrown HydricRateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(HydricRateLimitError);
        expect((error as HydricRateLimitError).retryAfter).toBe(45);
      }
    });
  });
});
