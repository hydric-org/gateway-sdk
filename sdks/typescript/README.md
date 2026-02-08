# @hydric/gateway

[![npm version](https://img.shields.io/npm/v/@hydric/gateway.svg?style=flat-square)](https://www.npmjs.com/package/@hydric/gateway)
[![license](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/hydric-org/gateway-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

> **The Universal DeFi Normalized Data Layer.**
> High-fidelity, multi-protocol, multi-chain data SDK designed for builders who demand performance and type-safety.

---

## 🌊 Overview

The **@hydric/gateway** SDK is the official TypeScript client for interacting with the [hydric gateway](https://docs.hydric.org). It provides a sleek, normalized interface to complex cross-chain DeFi data, abstracting away the nuances of individual protocols and network differences.

### Why hydric?

- 🚀 **Zero Config Start:** One client, immediate data access.
- 💎 **Nominal Integrity:** Uses **Branded Types** and **Enums** to prevent logical contamination (e.g., you can't pass a raw string where a `ValidAddress` is expected).
- ⚡ **IntelliSense Driven:** Automated type generation ensures your IDE knows exactly what data is coming back.
- 🛡️ **Fail Fast & Loud:** Descriptive, named errors (`HydricError`) for faster debugging.
- 📦 **Zero Dependencies:** Ultra-lightweight using native `fetch`.

---

## 🚀 Installation

```bash
npm install @hydric/gateway
# or
pnpm add @hydric/gateway
# or
yarn add @hydric/gateway
```

---

## ⚡ Quick Start

Get up and running in seconds.

```typescript
import { HydricGateway } from '@hydric/gateway';

// 1. Initialize the client
const hydric = new HydricGateway({
  apiKey: 'your_api_key_here', // Get one at dashboard.hydric.org
});

async function run() {
  try {
    // 2. Fetch a curated token basket
    const stablecoins = await hydric.tokenBaskets.getMultiChainById({
      basketId: 'usd-stablecoins',
    });

    console.log(`Found ${stablecoins.basket.tokens.length} tokens in the basket!`);

    // 3. Search for tokens across chains
    const results = await hydric.singleChainTokens.search(1, {
      search: 'USDC',
    });

    console.log('Search Results:', results.tokens);
  } catch (error) {
    console.error('Something went wrong:', error);
  }
}

run();
```

---

## 🛠️ Key Features

### 1. Resource-Based Architecture

The SDK is organized into logical resources for better DX:

- `hydric.multichainTokens`: Search and aggregate tokens across different networks.
- `hydric.singleChainTokens`: High-performance operations for specific chains.
- `hydric.tokenBaskets`: Access curated, thematic groups of tokens (Stables, ETH Pegged, etc.).

### 2. Robust Error Handling

Never guess why a request failed. We provide specific error classes for every scenario:

```typescript
import { HydricRateLimitError, HydricNotFoundError } from '@hydric/gateway';

try {
  await hydric.tokenBaskets.getMultiChainById({ basketId: 'invalid-id' });
} catch (error) {
  if (error instanceof HydricNotFoundError) {
    // Handle 404
  } else if (error instanceof HydricRateLimitError) {
    // Handle 429
  }
}
```

---

### 🌐 Compatibility

- **ESM & CommonJS** supported out of the box.
- **Node.js 18+** (uses native `fetch`).
- **Browser** compatible (Tree-shakable).

---

## 📋 API Reference

Detailed documentation is available at [docs.hydric.org](https://docs.hydric.org).

---

## 📜 License

Licensed under the **Apache License, Version 2.0**. See [LICENSE](https://github.com/hydric-org/gateway-sdk/blob/main/LICENSE) for details.

---

<p align="center">
  Built with ❤️ by the <b>hydric</b> team.
</p>
