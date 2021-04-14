import { OMEOrder, SignedOrderData } from '../Types/types';

//serialise an order for the OME
const orderToOMEOrder:(web3: any, signedOrder: SignedOrderData) => OMEOrder = (web3, signedOrder) => {
    let omeOrder = {
        id: "123",
        user: web3.utils.toChecksumAddress(signedOrder.order.user),
        target_tracer: web3.utils.toChecksumAddress(signedOrder.order.targetTracer),
        side: signedOrder.order.side ? "Bid" : "Ask",
        price: signedOrder.order.price,
        amount: signedOrder.order.amount,
        expiration: signedOrder.order.expiration,
        signed_data: web3.utils.hexToBytes("0x" + signedOrder.sigR.substring(2) + signedOrder.sigS.substring(2) + signedOrder.sigV.toString(16)),
        nonce: web3.utils.toHex(signedOrder.order.nonce)
    } as OMEOrder
    return omeOrder
}

//serialise an order from the OME back into its the form expected by the contracts
const omeOrderToOrder:(web3: any, omeOrder: OMEOrder) => SignedOrderData = (web3, omeOrder) => {
    //Parse sigR, sigS, sigV as per EIP712
    let sigAsByteString : string = web3.utils.bytesToHex(omeOrder.signed_data)
    sigAsByteString = sigAsByteString.substring(2)

    return  {
        order: {
            amount: omeOrder.amount.toString(),
            price: omeOrder.price.toString(),
            side: omeOrder.side === "Bid",
            user: web3.utils.toChecksumAddress(omeOrder.user),
            expiration: omeOrder.expiration,
            targetTracer: web3.utils.toChecksumAddress(omeOrder.target_tracer),
            nonce: parseInt(omeOrder.nonce, 16)
        },
        sigR: "0x" + sigAsByteString.substring(0, 64),
        sigS: "0x" + sigAsByteString.substring(64, 128),
        sigV: parseInt(sigAsByteString.substring(128, 130), 16)
    } as SignedOrderData
}

export {
    orderToOMEOrder
}