

## Description
Utils package for common functions within the Tracer ecosystem.


## Strucure
When creating a new directory follow the structure of 

```
-- src
    -- NewUtilsSpace
        -- index.ts // export or main 
        -- Folder1
        -- Folder2
        -- types
```

## Current Packages
### OME
Provides OME connection functionality
- createMarket: create a market on the OME
- submitOrder: submits a signed order to the OME
- orderToOMEOrder: converts a signed order as per the EIP712 setup (generated via the signing package) to the structure that the OME expects. This can be used to then submit orders to the OME.

### Signing
Provides common EIP712 signing functionality
- signOrder: allows a node to sign an order using eth_signTypedData
- signOrders: allows the bulk signing of orders