const fetch = require("node-fetch")
//import fetch from "node-fetch"
import { OrderData, SignedOrder } from '../Types/types';

//serialise an order for the OME
const orderToOMEOrder:(web3: any, signedOrder: { order: OrderData, sigR: String, sigS: String, sigV: number }) => SignedOrder = (web3, signedOrder) => {
    let omeOrder = {
        id: "123",
        address: web3.utils.toChecksumAddress(signedOrder.order.user),
        market: web3.utils.toChecksumAddress(signedOrder.order.targetTracer),
        side: signedOrder.order.side ? "Bid" : "Ask",
        price: signedOrder.order.price,
        amount: signedOrder.order.amount,
        expiration: signedOrder.order.expiration,
        signed_data: web3.utils.hexToBytes("0x" + signedOrder.sigR.substring(2) + signedOrder.sigS.substring(2) + signedOrder.sigV.toString(16)),
        nonce: web3.utils.toHex(signedOrder.order.nonce)
    }
    return omeOrder
}

/**
 * Converts a market address from its ETH address form 0xaBc to
 * its ome form aBc
 */
const omefy = (market: string) => {
    return market.slice(2)
}

const createMarket = async (market: string, omeAddress: string) => {
    // Note: The ome accepts a market of the form 0x here as it is in data, not the path
    return fetch(`${omeAddress}/book`, { method: "POST", body: JSON.stringify({market: market}), headers: { 'Content-Type': 'application/json' } })
}

const getMarkets = async(omeAddress: string) => {
    return fetch(`${omeAddress}/book`, { method: "GET", headers: { 'Content-Type': 'application/json' } })
}

const getOrders = async(market: string, omeAddress: string) => {
    return fetch(`${omeAddress}/book/${omefy(market)}`, { method: "GET", headers: { 'Content-Type': 'application/json' } })
}

const submitOrder = async (market: string, order: SignedOrder, omeAddress: string) => {
    return fetch(`${omeAddress}/book/${omefy(market)}/order`, { method: "POST", body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } })
}

export {
    orderToOMEOrder,
    createMarket,
    submitOrder,
    getMarkets,
    getOrders
}