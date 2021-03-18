export type DomainDataType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
]

export type LimitOrderDataType = [
    { name: "amount", type: "uint256" },
    { name: "price", type: "int256" },
    { name: "side", type: "bool" },
    { name: "user", type: "address" },
    { name: "expiration", type: "uint256" },
    { name: "targetTracer", type: "address" },
    { name: "nonce", type: "uint256" }
]

export interface DomainData {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}

export type OrderData = {
    amount: number | string
    price: number | string // price the order is being taken at 
    side: boolean // true for long false for short
    user: string, // address of the user
    expiration: number | string, // expiration in seconds 
    targetTracer: string, // address of tracer contract
    nonce: number,
}

export type SigningData = {
    domain: DomainData,
    primaryType: "LimitOrder",
    message: OrderData,
    types: DataType,
}

export type DataType = {
    EIP712Domain: DomainDataType,
    LimitOrder: LimitOrderDataType
}