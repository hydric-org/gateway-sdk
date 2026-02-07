# hydric Gateway SDK family

Universal DeFi normalized data layer. Easy to use, multi-protocol, multi-chain data SDKs.

## Project Structure

```
hydric/
├── .github/              # Unified CI/CD (GitHub Actions)
├── docs/                 # Mintlify source files
├── specs/                # openapi.json (The source of truth)
└── sdks/                 # The family of SDKs
    ├── typescript/       # @hydric/gateway SDK
    ├── python/           # Future
    └── go/               # Future
```

## Development

This is a monorepo using `pnpm`.

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0

### Setup

```bash
pnpm install
```

### TypeScript SDK

Located in `sdks/typescript/`.

```bash
cd sdks/typescript
pnpm build
```
