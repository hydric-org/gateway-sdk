import { components } from '../generated/api-types.js';
import { fetchHydricApi } from '../utils/fetch-hydric-api.js';

export type GetMultiChainTokenListParams =
  components['schemas']['GetMultiChainTokenListRequestParams'];
export type GetMultiChainTokenListResult = components['schemas']['GetMultiChainTokenListResponse'];

/**
 * Resource class for interacting with multi-chain token endpoints.
 */
export class MultiChainTokensResource {
  constructor(
    /** @internal */
    private readonly baseUrl: string,
    /** @internal */
    private readonly getHeaders: () => HeadersInit,
  ) {}

  /**
   * Returns a list of tokens containing metadata for multiple blockchains in one single model.
   *
   * @param params - Configuration and filters for the token list.
   * @returns A promise that resolves to the multi-chain token list response.
   * @throws {HydricApiError} If the API returns an error response.
   * @throws {HydricNotFoundError} If the requested resource is not found (404).
   * @throws {HydricRateLimitError} If the rate limit is exceeded (429).
   *
   * @example
   * ```typescript
   * const { tokens, nextCursor } = await hydric.multichainTokens.list({
   *   config: {
   *     limit: 10,
   *     orderBy: { field: 'tvl', direction: 'desc' }
   *   },
   *   filters: {
   *     chainIds: [1, 8453]
   *   }
   * });
   * ```
   */
  public async list(
    params: GetMultiChainTokenListParams = {},
  ): Promise<GetMultiChainTokenListResult> {
    return fetchHydricApi<GetMultiChainTokenListResult>(`${this.baseUrl}/v1/tokens`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
  }
}
