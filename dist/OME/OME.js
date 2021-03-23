import { __awaiter } from "tslib";
const OMEAddress = "http://localhost:8989";
const fetch = require("node-fetch");
const orderToOMEOrder = (web3, order, sig) => {
    let omeOrder = {
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
const createMarket = (market) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(`${OMEAddress}/book`, { method: "POST", body: JSON.stringify({ market: market }), headers: { 'Content-Type': 'application/json' } });
});
const submitOrder = (market, order) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(`${OMEAddress}/book/${market}/order`, { method: "POST", body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
});
export { orderToOMEOrder, createMarket, submitOrder };
//# sourceMappingURL=OME.js.map