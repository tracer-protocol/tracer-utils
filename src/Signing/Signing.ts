import {
    DomainDataType,
    OrderDataType,
    DomainData,
    OrderData,
    SigningData,
    Signature,
} from "../Types/types";

/* Support types for signing */
const domain: DomainDataType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
];

const orderType: OrderDataType = [
    { name: "maker", type: "address" },
    { name: "market", type: "address" },
    { name: "price", type: "uint256" },
    { name: "amount", type: "uint256" },
    { name: "side", type: "uint256" },
    { name: "expires", type: "uint256" },
    { name: "created", type: "uint256" },
];

/**
 *
 * @param traderAddress Trader contract address
 * @param chainId network id, defaults to localhost if none is given
 * @returns
 */
const generateDomainData: (
    traderAddress: string,
    chainId?: number
) => DomainData = (traderAddress, chainId) => {
    return {
        name: "Tracer Protocol",
        version: "1.0",
        chainId: chainId ? chainId : 1337,
        verifyingContract: traderAddress,
    };
};

/* Helpers for signing */
/**
 * Helper for singing
 * @param web3 Web3 instance
 * @param signingAccount address of the user signing orders
 * @param data
 * @returns
 */
const signOrder: (
    web3: any,
    signingAccount: string,
    data: SigningData,
    signMethod: string
) => Promise<Signature> = async (web3, signingAccount, data, signMethod) => {
    const signer = web3.utils.toChecksumAddress(signingAccount);

    return new Promise((resolve, reject) => {
        if (!web3 || !web3?.currentProvider || !web3?.currentProvider?.send) {
            reject("Web3.currentProvider can not be undefined");
        }
        return web3.currentProvider?.send(
            {
                method: signMethod,
                params: [
                    signer,
                    // sign typed data v3 expects stringified data
                    signMethod === "eth_signTypedData_v3"
                        ? JSON.stringify(data)
                        : data,
                ],
                from: signer,
            },
            async (err: any, result: any) => {
                if (err || result.error) {
                    reject(err ?? result.error);
                }
                console.log(result);
                try {
                    let parsedSig = result.result.substring(2);
                    const r: string = "0x" + parsedSig.substring(0, 64);
                    const s: string = "0x" + parsedSig.substring(64, 128);
                    const v: number = parseInt(
                        parsedSig.substring(128, 130),
                        16
                    ); //130 hex = 65bytes
                    resolve({
                        sigR: r,
                        sigS: s,
                        sigV: v,
                    });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

/**
 * Process and sign orders
 * @param web3 Web3 instance
 * @param orders array of orders
 * @param traderAddress address of the deployed trader contract
 * @returns the signed data along with the order
 */
const _signOrders: (
    web3: any,
    orders: OrderData[],
    traderAddress: string,
    signMethod: string
) => Promise<
    Promise<{ order: OrderData; sigR: string; sigS: string; sigV: number }>[]
> = async (web3, orders, traderAddress, signMethod) => {
    let _domainData = generateDomainData(traderAddress);
    return await orders.map(async (order) => {
        let type = {
            EIP712Domain: domain,
            Order: orderType,
        };

        let dataToSign: SigningData = {
            domain: _domainData,
            primaryType: "Order",
            message: order,
            types: type,
        };

        let signedData: Signature = await signOrder(
            web3,
            order.maker,
            dataToSign,
            signMethod
        );

        return {
            order: order,
            sigR: signedData.sigR,
            sigS: signedData.sigS,
            sigV: signedData.sigV,
        };
    });
};

const signOrders: (
    web3: any,
    orders: OrderData[],
    traderAddress: string
) => Promise<
    Promise<{ order: OrderData; sigR: string; sigS: string; sigV: number }>[]
> = async (web3, orders, traderAddress) => {
    return _signOrders(web3, orders, traderAddress, "eth_signTypedData");
};

const signOrdersV3: (
    web3: any,
    orders: OrderData[],
    traderAddress: string
) => Promise<
    Promise<{ order: OrderData; sigR: string; sigS: string; sigV: number }>[]
> = async (web3, orders, traderAddress) => {
    return _signOrders(web3, orders, traderAddress, "eth_signTypedData_v3");
};

export {
    signOrders,
    signOrdersV3,
    signOrder,
    generateDomainData,
    domain,
    orderType,
};
