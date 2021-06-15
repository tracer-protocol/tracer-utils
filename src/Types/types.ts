export type DomainDataType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
]

export type OrderDataType = [
    { name: "maker", type: "address" },
    { name: "market", type: "address" },
    { name: "price", type: "uint256" },
    { name: "amount", type: "uint256" },
    { name: "side", type: "uint256" },
    { name: "expires", type: "uint256" },
    { name: "created", type: "uint256" },
]

export interface DomainData {
    name: string;
    version: string;
    chainId: number;
}

export type OrderData = {
    maker: string, // address of the user
    market: string, // address of tracer contract
    price: number | string, // price the order is being taken at 
    amount: number | string,
    side: number // true for long false for short
    expires: number | string, // expiration in seconds 
    created: number | string,
}

export type SignedOrderData = {
    order: OrderData,
    sigR: string,
    sigS: string,
    sigV: number
}

export type Signature = {
    sigR: string
    sigS: string
    sigV: number
}

export type OMEOrder = {
    id: string,
    user: string,
    target_tracer: string,
    side: string,
    price: number | string,
    amount: number | string,
    amount_left: number | string,
    expiration: number | string,
    created: number | string,
    signed_data: string,
}

export type SigningData = {
    domain: DomainData,
    primaryType: "Order",
    message: OrderData,
    types: DataType,
}

export type DataType = {
    EIP712Domain: DomainDataType,
    Order: OrderDataType
}
