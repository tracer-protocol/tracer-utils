import { OrderData, Signature, SignedOrder } from '../Types/types';
declare const orderToOMEOrder: (web3: any, order: OrderData, sig: Signature) => SignedOrder;
declare const createMarket: (market: string) => Promise<any>;
declare const submitOrder: (market: string, order: SignedOrder) => Promise<any>;
export { orderToOMEOrder, createMarket, submitOrder };
