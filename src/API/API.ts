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

/**
 * Sends a request to the API to create a market
 * @param market the Ethereum address representing this tracer market
 * @param apiAddress the IP of the API
 * @returns
 */
const createMarket = async (market: string, apiAddress: string) => {
    // Note: The ome accepts a market of the form 0x here as it is in data, not the path
    return fetch(`${apiAddress}/book`, { method: "POST", body: JSON.stringify({market: market}), headers: { 'Content-Type': 'application/json' } })
}

/**
 * Gets all markets from the API
 * @param apiAddress the IP of the API
 * @returns
 */
const getMarkets = async(apiAddress: string) => {
    return fetch(`${apiAddress}/book`, { method: "GET", headers: { 'Content-Type': 'application/json' } })
}

/**
 *
 * @param market the Ethereum address representing this tracer market
 * @param apiAddress the IP of the API
 * @returns
 */
const getOrders = async(market: string, apiAddress: string) => {
    return fetch(`${apiAddress}/book/${omefy(market)}`, { method: "GET", headers: { 'Content-Type': 'application/json' } })
}

/**
 *
 * @param market the Ethereum address representing this tracer market
 * @param order the order to be submitted to the API
 * @param apiAddress the IP of the API
 * @returns
 */
const submitOrder = async (market: string, order: OMEOrder, apiAddress: string) => {
    return fetch(`${apiAddress}/book/${omefy(market)}/order`, { method: "POST", body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } })
}

export {
    createMarket,
    submitOrder,
    getMarkets,
    getOrders
}