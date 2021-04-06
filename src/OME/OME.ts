const fetch = require("node-fetch")
//import fetch from "node-fetch"
import { OrderData, SignedOrder } from '../Types/types';

//serialise an order for the OME
const orderToOMEOrder:(web3: any,  order: OrderData, sig: { order: OrderData, sigR: String, sigS: String, sigV: number }) => SignedOrder = (web3, order, sig) => {
    let omeOrder = {
        id: "123",
        address: web3.utils.toChecksumAddress(order.user),
        market: web3.utils.toChecksumAddress(order.targetTracer),
        side: order.side ? "Bid" : "Ask",
        price: order.price,
        amount: order.amount,
        expiration: order.expiration,
        signed_data: web3.utils.hexToBytes("0x" + sig.sigR.substring(2) + sig.sigS.substring(2) + sig.sigV.toString(16)),
        nonce: web3.utils.toHex(order.nonce)
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

export {
    orderToOMEOrder,
    createMarket,
    submitOrder,
    getMarkets,
    getOrders
}