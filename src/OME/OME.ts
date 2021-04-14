const fetch = require("node-fetch")
//import fetch from "node-fetch"
import { OMEOrder } from '../Types/types';


/**
 * Converts a market address from its ETH address form 0xaBc to
 * its ome form aBc. This is due to the leading 0x causing rust issues on the url path
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

const submitOrder = async (market: string, order: OMEOrder, omeAddress: string) => {
    return fetch(`${omeAddress}/book/${omefy(market)}/order`, { method: "POST", body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } })
}

export {
    createMarket,
    submitOrder,
    getMarkets,
    getOrders
}