import { DomainDataType, LimitOrderDataType, DomainData, OrderData, SigningData, Signature } from '../Types/types';
declare const domain: DomainDataType;
declare const limitOrder: LimitOrderDataType;
declare const generateDomainData: (traderAddress: string, chainId?: number) => DomainData;
declare const signOrder: (web3: any, signingAccount: string, data: SigningData) => Promise<Signature>;
declare const signOrders: (web3: any, orders: OrderData[], traderAddress: string) => Promise<Promise<{
    order: OrderData;
    sig: Signature;
}>[]>;
export { signOrders, signOrder, generateDomainData, domain, limitOrder };
