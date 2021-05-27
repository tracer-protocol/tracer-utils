import { OMEOrder, OrderData, SignedOrderData } from '../Types/types';

/**
 * Serialises an order from its raw signed format to a format supported by the OME
 * @param web3 an instance of web3
 * @param signedOrder raw signed order given by the signOrder function in this package
 * @returns an order to be sent to the OME
 */
const orderToOMEOrder:(web3: any, signedOrder: SignedOrderData) => OMEOrder = (web3, signedOrder) => {
    return {
        user: web3.utils.toChecksumAddress(signedOrder.order.maker),
        target_tracer: web3.utils.toChecksumAddress(signedOrder.order.market),
        side: signedOrder.order.side == 0 ? "Bid" : "Ask",
        price: signedOrder.order.price,
        amount: signedOrder.order.amount,
        expiration: signedOrder.order.expires,
        signed_data: web3.utils.hexToBytes("0x" + signedOrder.sigR.substring(2) + signedOrder.sigS.substring(2) + signedOrder.sigV.toString(16)),
    } as OMEOrder
}

/**
 * Serialises an order from its format returned from the OME to an order that can be
 * submitted to the contracts
 * @param web3 an instance of web3
 * @param omeOrder order type form the ome
 * @returns an order that can be sent to the contracts
 */
const omeOrderToOrder:(web3: any, omeOrder: OMEOrder) => SignedOrderData = (web3, omeOrder) => {
    let sigAsByteString : string = web3.utils.bytesToHex(omeOrder.signed_data)
    sigAsByteString = sigAsByteString.substring(2)

    return  {
        order: {
            amount: omeOrder.amount.toString(),
            price: omeOrder.price.toString(),
            side: omeOrder.side == "Bid" ? 0 : 1,
            maker: web3.utils.toChecksumAddress(omeOrder.user),
            expires: omeOrder.expiration,
            market: web3.utils.toChecksumAddress(omeOrder.target_tracer),
            created: 0 //todo
        } as OrderData,
        //Parse sigR, sigS, sigV as per EIP712
        sigR: "0x" + sigAsByteString.substring(0, 64),
        sigS: "0x" + sigAsByteString.substring(64, 128),
        sigV: parseInt(sigAsByteString.substring(128, 130), 16)
    } as SignedOrderData
}

export {
    orderToOMEOrder,
    omeOrderToOrder
}