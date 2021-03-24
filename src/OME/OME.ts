const fetch = require("node-fetch")
import { OrderData, Signature, SignedOrder } from '../Types/types';

const orderToOMEOrder:(web3: any,  order: OrderData, sig: Signature) => SignedOrder = (web3, order, sig) => {
    let omeOrder = {
        id: "123",
        address: order.user,
        market: order.targetTracer,
        side: order.side ? "Bid" : "Ask",
        price: order.price,
        amount: order.amount,
        expiration: order.expiration,
        signed_data: web3.utils.hexToBytes("0x" + sig.sigR.substring(2) + sig.sigS.substring(2) + sig.sigV.toString(16)),
        nonce: web3.utils.toHex(order.nonce)
    }
    return omeOrder
}


const createMarket = async (market: string, omeAddress: string) => {
    return fetch(`${omeAddress}/book`, { method: "POST", body: JSON.stringify({market: market}), headers: { 'Content-Type': 'application/json' } })
}

const getMarkets = async(omeAddress: string) => {
    return fetch(`${omeAddress}/book`, { method: "GET", headers: { 'Content-Type': 'application/json' } })
}

const getOrders = async(market: string, omeAddress: string) => {
    return fetch(`${omeAddress}/book/${market}`, { method: "GET", headers: { 'Content-Type': 'application/json' } })
}

const submitOrder = async (market: string, order: SignedOrder, omeAddress: string) => {
    return fetch(`${omeAddress}/book/${market}/order`, { method: "POST", body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } })
}

export {
    orderToOMEOrder,
    createMarket,
    submitOrder,
    getMarkets,
    getOrders
}