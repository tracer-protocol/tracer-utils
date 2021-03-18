import { DomainDataType, LimitOrderDataType, DomainData, OrderData, SigningData } from './types';
declare const _default: {
    signOrders: (web3: any, orders: OrderData[], traderAddress: string) => Promise<Promise<{
        order: OrderData;
        sigR: string;
        sigS: string;
        sigV: string;
    }>[]>;
    signOrder: (web3: any, signingAccount: string, data: SigningData) => Promise<[string, string, string]>;
    generateDomainData: (trader_address: string, chainId?: number | undefined) => DomainData;
    domain: DomainDataType;
    limitOrder: LimitOrderDataType;
};
export default _default;
