export declare type DomainDataType = [
    {
        name: "name";
        type: "string";
    },
    {
        name: "version";
        type: "string";
    },
    {
        name: "chainId";
        type: "uint256";
    },
    {
        name: "verifyingContract";
        type: "address";
    }
];
export declare type LimitOrderDataType = [
    {
        name: "amount";
        type: "uint256";
    },
    {
        name: "price";
        type: "int256";
    },
    {
        name: "side";
        type: "bool";
    },
    {
        name: "user";
        type: "address";
    },
    {
        name: "expiration";
        type: "uint256";
    },
    {
        name: "targetTracer";
        type: "address";
    },
    {
        name: "nonce";
        type: "uint256";
    }
];
export interface DomainData {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
}
export declare type OrderData = {
    amount: number | string;
    price: number | string;
    side: boolean;
    user: string;
    expiration: number | string;
    targetTracer: string;
    nonce: number;
};
export declare type Signature = {
    sigR: string;
    sigS: string;
    sigV: number;
};
export declare type SignedOrder = {
    id: string;
    address: string;
    side: string;
    price: number | string;
    amount: number | string;
    expiration: number | string;
    signed_data: string;
};
export declare type SigningData = {
    domain: DomainData;
    primaryType: "LimitOrder";
    message: OrderData;
    types: DataType;
};
export declare type DataType = {
    EIP712Domain: DomainDataType;
    LimitOrder: LimitOrderDataType;
};
