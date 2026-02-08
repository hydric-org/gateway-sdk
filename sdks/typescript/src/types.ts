import { components } from './generated/api-types.js';

// General
export type SupportedChainId = components['schemas']['BlockchainAddress']['chainId'];
export type BlockchainAddress = components['schemas']['BlockchainAddress'];

// Single Chain Tokens
export type SingleChainTokenMetadata = components['schemas']['SingleChainTokenMetadata'];
export type GetSingleChainTokenListParams = components['schemas']['GetSingleChainTokenListRequestBody'];
export type GetSingleChainTokenListResult = components['schemas']['GetSingleChainTokenListResponse'];
export type SearchSingleChainTokensParams = components['schemas']['SearchSingleChainTokensRequestBody'];
export type SearchSingleChainTokensResult = components['schemas']['SearchSingleChainTokensResponse'];

// Multi Chain Tokens
export type MultiChainTokenMetadata = components['schemas']['MultiChainTokenMetadata'];
export type GetMultiChainTokenListParams = components['schemas']['GetMultiChainTokenListRequestParams'];
export type GetMultiChainTokenListResult = components['schemas']['GetMultiChainTokenListResponse'];
export type SearchMultichainTokensParams = components['schemas']['SearchMultichainTokensRequestParams'];
export type SearchMultichainTokensResult = components['schemas']['SearchMultichainTokensResponse'];

// Pools
export type LiquidityPool = components['schemas']['LiquidityPool'];

// Protocols
export type Protocol = components['schemas']['Protocol'];

// Token Baskets
export type TokenBasket = components['schemas']['TokenBasket'];
export type TokenBasketId = components['schemas']['TokenBasket']['id'];
export type GetTokenBasketListResult = components['schemas']['GetTokenBasketListResponse'];
export type GetSingleTokenBasketResult = components['schemas']['GetTokenBasketResponse'];

export type GetTokenBasketsListParams = components['schemas']['GetTokenBasketsListQueryParams'];
export type GetMultichainBasketParams = components['schemas']['GetSingleMultiChainBasketPathParams'] & components['schemas']['GetMultipleChainsTokenBasketsQueryParams'];

export type GetSingleChainBasketParams = components['schemas']['GetSingleChainBasketPathParams'];
