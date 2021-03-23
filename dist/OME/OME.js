"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitOrder = exports.createMarket = exports.orderToOMEOrder = void 0;
var tslib_1 = require("tslib");
var OMEAddress = "http://localhost:8989";
var fetch = require("node-fetch");
var orderToOMEOrder = function (web3, order, sig) {
    var omeOrder = {
        id: "123",
        address: order.user,
        side: order.side ? "Bid" : "Ask",
        price: order.price,
        amount: order.amount,
        expiration: order.expiration,
        signed_data: web3.utils.hexToBytes("0x" + sig.sigR.substring(2) + sig.sigS.substring(2) + sig.sigV.toString(16)),
    };
    return omeOrder;
};
exports.orderToOMEOrder = orderToOMEOrder;
var createMarket = function (market) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, fetch(OMEAddress + "/book", { method: "POST", body: JSON.stringify({ market: market }), headers: { 'Content-Type': 'application/json' } })];
    });
}); };
exports.createMarket = createMarket;
var submitOrder = function (market, order) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, fetch(OMEAddress + "/book/" + market + "/order", { method: "POST", body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } })];
    });
}); };
exports.submitOrder = submitOrder;
//# sourceMappingURL=OME.js.map