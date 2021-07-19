# Description
Utility package for common functions within the Tracer ecosystem. Useful for clients who wish to interact with the Tracer protocol.
# Usage
```
npm install @tracer-protocol/tracer-utils
```

To use any of the packages, simply import the function from the package you wish to use, directly from the tracer-utils library.
```
import { signOrders } from "@tracer-protocol/tracer-utils`
await signOrders(...)
```
# Packages
## API
This package adds utility functions for interacting with the Tracer [API](https://github.com/tracer-protocol/perpetual-api).

Supported are the following functions
- createMarket: create a new market on the API. Markets are identified by their Ethereum address.
- getMarkets: returns all markets currently registered with the API
- getOrders: returns all orders currently associated with a market
- submitOrder: submits an EIP712 compliant signed order to the API.

## Signing
This package adds utility functionality for signing orders via the EIP712 [specification](https://eips.ethereum.org/EIPS/eip-712). The contracts currently utilise V4 of the EIP712 spec. Both `eth_signTypedData` and `eth_signTypedData_v4` calls are supported due to how some wallet implementations handle this EIP.

Supported are the following functions
- signOrders: sign multiple orders via a local Ethereum node using the eth_signTypedData RPC call
- signOrdersV4: sign multiple orders via a local Ethereum node using the eth_signTypedData_v4 RPC call
- verifySignature: verifies a provided order was signed by a specific signer.
- generateDomainData: generates EIP712 compliant domain data for a given trader address on a given network.

## Serialisation
This package adds utility functionality for serialising orders between the contracts and the OME

Supported are the following functions
- orderToOMEOrder: converts an order from the raw signed order type to a type supported by the OME
- omeOrderToOrder: converts an order sent from the OME into the type to send it to the contracts

# Development
## Contributing
When creating a new package follow the structure of

```
-- src
    -- NewUtilsSpace
        -- index.ts // export or main
        -- source.ts
        -- extra source files or folders
```