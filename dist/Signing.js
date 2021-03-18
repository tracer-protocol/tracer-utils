var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* Support types for signing */
export const domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
];
export const limitOrder = [
    { name: "amount", type: "uint256" },
    { name: "price", type: "int256" },
    { name: "side", type: "bool" },
    { name: "user", type: "address" },
    { name: "expiration", type: "uint256" },
    { name: "targetTracer", type: "address" },
    { name: "nonce", type: "uint256" },
];
export const generateDomainData = (trader_address, chainId) => {
    return ({
        name: "Tracer Protocol",
        version: "1.0",
        chainId: chainId ? chainId : 1337,
        verifyingContract: trader_address,
    });
};
/* Helpers for signing */
export const signOrder = (web3, signingAccount, data) => __awaiter(void 0, void 0, void 0, function* () {
    const signer = web3.utils.toChecksumAddress(signingAccount);
    return new Promise((resolve, reject) => {
        var _a, _b;
        if (!web3 || !(web3 === null || web3 === void 0 ? void 0 : web3.currentProvider) || !((_a = web3 === null || web3 === void 0 ? void 0 : web3.currentProvider) === null || _a === void 0 ? void 0 : _a.send)) {
            reject("Web3.currentProvider can not be undefined");
        }
        return (_b = web3.currentProvider) === null || _b === void 0 ? void 0 : _b.send({
            method: "eth_signTypedData",
            params: [signer, data],
            from: signer,
        }, (err, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                reject(err);
            }
            let parsedSig = result.result.substring(2);
            const r = "0x" + parsedSig.substring(0, 64);
            const s = "0x" + parsedSig.substring(64, 128);
            const v = parseInt(parsedSig.substring(128, 130), 16).toString(); //130 hex = 65bytes
            resolve([r, s, v]);
        }));
    });
});
//Process and sign orders
export const signOrders = (web3, orders, traderAddress) => __awaiter(void 0, void 0, void 0, function* () {
    let _domainData = generateDomainData(traderAddress);
    return yield orders.map((order) => __awaiter(void 0, void 0, void 0, function* () {
        let type = {
            EIP712Domain: domain,
            LimitOrder: limitOrder,
        };
        let dataToSign = {
            domain: _domainData,
            primaryType: "LimitOrder",
            message: order,
            types: type,
        };
        let signedData = yield signOrder(web3, order.user, dataToSign);
        return {
            order: order,
            sigR: signedData[0],
            sigS: signedData[1],
            sigV: signedData[2],
        };
    }));
});
export default {
    signOrders, signOrder,
    generateDomainData,
    domain, limitOrder
};
//# sourceMappingURL=Signing.js.map