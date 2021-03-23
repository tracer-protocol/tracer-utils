const OMEAddress = "http://localhost:8989"
const fetch = require("node-fetch")
import { OrderData, Signature, SignedOrder } from '../Types/types';

const orderToOMEOrder:(web3: any,  order: OrderData, sig: Signature) => SignedOrder = (web3, order, sig) => {
    let omeOrder = {
        id: "123",
        address: order.user,
        side: order.side ? "Bid" : "Ask",
        price: order.price,
        amount: order.amount,
        expiration: order.expiration,
        signed_data: web3.utils.hexToBytes("0x" + sig.sigR.substring(2) + sig.sigS.substring(2) + sig.sigV.toString(16)),
    }
    return omeOrder
}


const createMarket = async (market: string) => {
    return fetch(`${OMEAddress}/book`, { method: "POST", body: JSON.stringify({market: market}), headers: { 'Content-Type': 'application/json' } })
}

const submitOrder = async (market: string, order: SignedOrder) => {
    return fetch(`${OMEAddress}/book/${market}/order`, { method: "POST", body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } })
}

export {
    orderToOMEOrder,
    createMarket,
    submitOrder
}