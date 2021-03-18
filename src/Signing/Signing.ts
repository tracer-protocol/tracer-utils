import { 
    DomainDataType, LimitOrderDataType, DomainData,
    OrderData, SigningData
} from './types';

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
const signOrder:(web3: any, signingAccount: string, data: SigningData) => Promise<[string, string, string]>
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
                const v: string = parseInt(parsedSig.substring(128, 130), 16).toString() //130 hex = 65bytes
                resolve ([r, s, v])
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
const signOrders = async (web3: any, orders: OrderData[], traderAddress: string) => {
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

        let signedData: [string, string, string] = await signOrder(web3, order.user, dataToSign)

        return {
            order: order,
            sigR: signedData[0],
            sigS: signedData[1],
            sigV: signedData[2],
        }
    })
}

export default {
    signOrders, signOrder, 
    generateDomainData,
    domain, limitOrder
}