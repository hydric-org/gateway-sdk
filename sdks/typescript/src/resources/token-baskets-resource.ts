import { components } from '../generated/api-types.js';
import { buildQueryString } from '../utils/build-query-string.js';
import { fetchHydricApi } from '../utils/fetch-hydric-api.js';

export type GetTokenBasketListResult = components['schemas']['GetTokenBasketListResponse'];
export type GetTokenBasketResult = components['schemas']['GetTokenBasketResponse'];

export type TokenBasketId = components['schemas']['TokenBasket']['id'];
export type SupportedChainId = components['schemas']['BlockchainAddress']['chainId'];
export type SupportedChainIds = SupportedChainId[] | undefined;

export type GetTokenBasketsListQueryParams =
  components['schemas']['GetTokenBasketsListQueryParams'];

export type GetMultipleChainsTokenBasketParams =
  components['schemas']['GetMultipleChainsTokenBasketsQueryParams'];

export type getSingleMultichainBasketParams =
  components['schemas']['GetSingleMultiChainBasketPathParams'] &
    components['schemas']['GetMultipleChainsTokenBasketsQueryParams'];

export type GetSingleChainBasketParams = components['schemas']['GetSingleChainBasketPathParams'];

/**
 * Resource class for interacting with token basket endpoints.
 *
 * @remarks
 * Token baskets are curated groups of related tokens, such as "USD Stablecoins" or "ETH Pegged Tokens".
 * Use this resource to discover and retrieve basket data across single or multiple chains.
 */
export class TokenBasketsResource {
  constructor(
    /** @internal */
    private readonly baseUrl: string,
    /** @internal */
    private readonly getHeaders: () => HeadersInit,
  ) {}

  /**
   * Returns all available token baskets across multiple chains.
   *
   * @param params - Optional configuration to filter baskets by chain IDs.
   * @param params.chainIds - Filter results to specific networks by chain ID. If omitted, defaults to all supported networks.
   * @param params.basketIds - Filter results to specific baskets by basket ID. If omitted, defaults to all supported baskets.
   * @returns A promise that resolves to the list of token baskets.
   *
   * @example
   * ```typescript
   * // Get all baskets across all chains
   * const { baskets } = await hydric.tokenBaskets.list();
   *
   * // Get baskets filtered to Ethereum and Base
   * const { baskets } = await hydric.tokenBaskets.list({ chainIds: [1, 8453] });
   *
   * ```
   */
  public async list(
    params: GetTokenBasketsListQueryParams = {},
  ): Promise<GetTokenBasketListResult> {
    const queryString = buildQueryString(params);
    const url = `${this.baseUrl}/v1/tokens/baskets${queryString}`;

    return fetchHydricApi<GetTokenBasketListResult>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  /**
   * Returns a specific token basket by ID across multiple chains.
   *
   * @param params - Configuration including the basket ID and optional chain ID filter.
   * @param params.basketId - The unique identifier of the basket (e.g., "usd-stablecoins").
   * @param params.chainIds - Filter results to specific networks by chain ID. If omitted, defaults to all supported networks.
   * @returns A promise that resolves to the requested token basket.
   * @throws {HydricInvalidParamsError} If the basket ID is invalid.
   * @throws {HydricNotFoundError} If the basket does not exist at all of the specified chain IDs.
   * @example
   * ```typescript
   * // Get USD stablecoins basket across all chains
   * const { basket } = await hydric.tokenBaskets.getMultiChainById({ basketId: 'usd-stablecoins' });
   *
   * // Get ETH pegged tokens only on Ethereum mainnet and Base
   * const { basket } = await hydric.tokenBaskets.getMultiChainById({
   *   basketId: 'eth-pegged-tokens',
   *   chainIds: [1, 8453]
   * });
   *
   * ```
   */
  public async getMultiChainById(
    params: getSingleMultichainBasketParams,
  ): Promise<GetTokenBasketResult> {
    const queryString = buildQueryString({ chainIds: params.chainIds });
    const url = `${this.baseUrl}/v1/tokens/baskets/${params.basketId}${queryString}`;

    return fetchHydricApi<GetTokenBasketResult>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  /**
   * Returns a specific token basket for a single blockchain network.
   *
   * @param params - Configuration including the chain ID and basket ID.
   * @param params.chainId - The numeric chain ID of the blockchain (e.g., 1 for Ethereum, 8453 for Base).
   * @param params.basketId - The unique identifier of the basket (e.g., "usd-stablecoins").
   * @returns A promise that resolves to the requested token basket for that chain.
   * @throws {HydricInvalidParamsError} If the basket ID or chain ID is invalid
   * @throws {HydricNotFoundError} If the basket does not exist on the specified chain.
   *
   * @example
   * ```typescript
   * // Get USD stablecoins on Base
   * const { basket } = await hydric.tokenBaskets.getSingleChainById({
   *   chainId: 8453,
   *   basketId: 'usd-stablecoins'
   * });
   *
   * ```
   */
  public async getSingleChainById(
    params: GetSingleChainBasketParams,
  ): Promise<GetTokenBasketResult> {
    const url = `${this.baseUrl}/v1/tokens/baskets/${params.chainId}/${params.basketId}`;

    return fetchHydricApi<GetTokenBasketResult>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }
}
