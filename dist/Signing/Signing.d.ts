import { DomainDataType, LimitOrderDataType, DomainData, OrderData, SigningData, Signature } from '../Types/types';
declare const _default: {
    signOrders: (web3: any, orders: OrderData[], traderAddress: string) => Promise<Promise<{
        order: OrderData;
        sig: Signature;
    }>[]>;
    signOrder: (web3: any, signingAccount: string, data: SigningData) => Promise<Signature>;
    generateDomainData: (traderAddress: string, chainId?: number | undefined) => DomainData;
    domain: DomainDataType;
    limitOrder: LimitOrderDataType;
};
export default _default;
