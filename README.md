# SupplyTrace – Blockchain Provenance and Marketplace

**SupplyTrace** is a blockchain-based system designed to enhance transparency and trust in goods trading. It records the origin, ownership, and lifecycle events of items like jewelry made from precious metals and woodworks. The system helps prevent counterfeiting, verifies authenticity, and maintains public traceability using smart contracts on Ethereum.

## Stakeholders and Roles

- **Primary Producers** – Register raw materials (example: silver, leather)
- **Manufacturers** – Create finished goods using raw components
- **Consumers** – Buy goods, view their provenance, report items as stolen

## Smart Contracts

### 1. `EntityContract.sol`
- Registers legitimate producers and manufacturers
- Prevents unverified users from listing products
- Provides verification via `isVerified(address)`

### 2. `ProvenanceContract.sol`
- Tracks product lifecycle: registration, creation, and ownership
- Allows ownership transfers
- Provides visibility into product provenance with `getOwner()`

### 3. `MarketplaceContract.sol`
- Allows only verified entities to list items
- Facilitates ownership transfers via Provenance contract
- Prevents resale of stolen items
- Records and exposes sale history via `getSaleHistory()`
## Deployment & Testing Guide (Using Remix)

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Compile all `.sol` files with Solidity ^0.8.20 or higher
3. Deploy contracts in this order:
   - `EntityContract`
   - `ProvenanceContract` (pass `EntityContract` address in constructor)
   - `MarketplaceContract` (pass both `EntityContract` and `ProvenanceContract` addresses)
4. Sample test flow:
   - Register a producer using `registerEntity()` in `EntityContract`
   - Register a component using `registerComponent()` in `ProvenanceContract`
   - Create a good using `createGood()`
   - List and buy the item in `MarketplaceContract`
   - Verify ownership change using `getOwner()` in `ProvenanceContract`
   - View transaction history using `getSaleHistory()`

## Trust and Transparency

- Verified sellers only (via `EntityContract`)
- Immutable ownership history
- Public functions to view current owner and full sale logs
- Stolen items cannot be resold

## Demo Video

https://www.youtube.com/watch?v=n3_yoUKX9q8

## Authors

- Cody Say – N11558849
- Duursakh Manaljav - N10836411
