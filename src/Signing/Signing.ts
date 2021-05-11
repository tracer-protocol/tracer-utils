import { 
    DomainDataType, LimitOrderDataType, DomainData,
    OrderData, SigningData, Signature
} from '../Types/types';

/* Support types for signing */
const domain:DomainDataType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
]

const limitOrder:LimitOrderDataType = [
    { name: "amount", type: "uint256" },
    { name: "price", type: "int256" },
    { name: "side", type: "bool" },
    { name: "user", type: "address" },
    { name: "expiration", type: "uint256" },
    { name: "targetTracer", type: "address" },
    { name: "nonce", type: "uint256" },
]

/**
 * 
 * @param traderAddress Trader contract address
 * @param chainId network id, defaults to localhost if none is given
 * @returns 
 */
const generateDomainData: (traderAddress: string, chainId?: number) => DomainData = (traderAddress, chainId) => {
    return ({
        name: "Tracer Protocol",
        version: "1.0",
        chainId: chainId ? chainId : 1337,
        verifyingContract: traderAddress,
    })
}


/* Helpers for signing */
/**
 * Helper for singing
 * @param web3 Web3 instance
 * @param signingAccount address of the user signing orders
 * @param data 
 * @returns 
 */
const signOrder:(web3: any, signingAccount: string, data: SigningData) => Promise<Signature>
    = async (
        web3, signingAccount, data
    ) => {
    const signer = web3.utils.toChecksumAddress(signingAccount)
    return new Promise((resolve, reject) => {
        if (!web3 || !web3?.currentProvider || !web3?.currentProvider?.send) {
            reject("Web3.currentProvider can not be undefined");
        }
        return web3.currentProvider?.send(
            {
                method: "eth_signTypedData",
                params: [signer, data],
                from: signer,
            },
            async (err: any, result: any) => {
                if (err) {
                    reject(err)
                }
                let parsedSig = result.result.substring(2)
                const r: string = "0x" + parsedSig.substring(0, 64)
                const s: string = "0x" + parsedSig.substring(64, 128)
                const v: number = parseInt(parsedSig.substring(128, 130), 16) //130 hex = 65bytes
                resolve({
                    sigR: r,
                    sigS: s,
                    sigV: v
                })
            }
        )
    })
}

/**
 * Process and sign orders
 * @param web3 Web3 instance
 * @param orders array of orders
 * @param traderAddress address of the deployed trader contract
 * @returns the signed data along with the order
 */
const signOrders: (web3: any, orders: OrderData[], traderAddress: string) => Promise<Promise<{ order: OrderData, sigR: string, sigS: string, sigV: number }>[]> = async (web3, orders, traderAddress) => {
    let _domainData = generateDomainData(traderAddress)
    return await orders.map(async (order) => {
        let type = {
            EIP712Domain: domain,
            LimitOrder: limitOrder,
        }

        let dataToSign:SigningData = {
            domain: _domainData,
            primaryType: "LimitOrder",
            message: order,
            types: type,
        }

        let signedData: Signature = await signOrder(web3, order.user, dataToSign)

        return {
            order: order,
            sigR: signedData.sigR,
            sigS: signedData.sigS,
            sigV: signedData.sigV
        }
    })
}

export {
    signOrders,
    signOrder, 
    generateDomainData,
    domain,
    limitOrder
}
