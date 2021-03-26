import { OrderData, Signature, SignedOrder } from '../Types/types';

//serialise an order for the OME
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

