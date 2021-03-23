"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitOrder = exports.domain = exports.generateDomainData = exports.signOrder = exports.signOrders = void 0;
var tslib_1 = require("tslib");
var domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
];
exports.domain = domain;
var limitOrder = [
    { name: "amount", type: "uint256" },
    { name: "price", type: "int256" },
    { name: "side", type: "bool" },
    { name: "user", type: "address" },
    { name: "expiration", type: "uint256" },
    { name: "targetTracer", type: "address" },
    { name: "nonce", type: "uint256" },
];
exports.limitOrder = limitOrder;
var generateDomainData = function (traderAddress, chainId) {
    return ({
        name: "Tracer Protocol",
        version: "1.0",
        chainId: chainId ? chainId : 1337,
        verifyingContract: traderAddress,
    });
};
exports.generateDomainData = generateDomainData;
var signOrder = function (web3, signingAccount, data) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var signer;
    return tslib_1.__generator(this, function (_a) {
        signer = web3.utils.toChecksumAddress(signingAccount);
        return [2, new Promise(function (resolve, reject) {
                var _a, _b;
                if (!web3 || !(web3 === null || web3 === void 0 ? void 0 : web3.currentProvider) || !((_a = web3 === null || web3 === void 0 ? void 0 : web3.currentProvider) === null || _a === void 0 ? void 0 : _a.send)) {
                    reject("Web3.currentProvider can not be undefined");
                }
                return (_b = web3.currentProvider) === null || _b === void 0 ? void 0 : _b.send({
                    method: "eth_signTypedData",
                    params: [signer, data],
                    from: signer,
                }, function (err, result) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var parsedSig, r, s, v;
                    return tslib_1.__generator(this, function (_a) {
                        if (err) {
                            reject(err);
                        }
                        parsedSig = result.result.substring(2);
                        r = "0x" + parsedSig.substring(0, 64);
                        s = "0x" + parsedSig.substring(64, 128);
                        v = parseInt(parsedSig.substring(128, 130), 16);
                        resolve({
                            sigR: r,
                            sigS: s,
                            sigV: v
                        });
                        return [2];
                    });
                }); });
            })];
    });
}); };
exports.signOrder = signOrder;
var signOrders = function (web3, orders, traderAddress) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _domainData;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _domainData = generateDomainData(traderAddress);
                return [4, orders.map(function (order) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var type, dataToSign, signedData;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    type = {
                                        EIP712Domain: domain,
                                        LimitOrder: limitOrder,
                                    };
                                    dataToSign = {
                                        domain: _domainData,
                                        primaryType: "LimitOrder",
                                        message: order,
                                        types: type,
                                    };
                                    return [4, signOrder(web3, order.user, dataToSign)];
                                case 1:
                                    signedData = _a.sent();
                                    return [2, {
                                            order: order,
                                            sig: signedData,
                                        }];
                            }
                        });
                    }); })];
            case 1: return [2, _a.sent()];
        }
    });
}); };
exports.signOrders = signOrders;
//# sourceMappingURL=Signing.js.map