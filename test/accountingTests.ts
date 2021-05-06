import { expect } from 'chai';
import { calcTradeExposure } from "../src/Accounting"

const orders = [
    {
        amount: 10,
        price: 1
    }, 
    {
        amount: 20,
        price: 1.1
    }, 
    {
        amount: 30,
        price: 1.2
    }
]

describe('calcTradeExposure', () => {
  it('no orders', () => {
    const { exposure, slippage, tradePrice } = calcTradeExposure(0, 1, [])
    expect(exposure).to.equal(0);
    expect(slippage).to.equal(0);
    expect(tradePrice).to.equal(0);
  });

  it('no margin, no exposure', () => {
    const { exposure, slippage, tradePrice } = calcTradeExposure(0, 1, orders)
    expect(exposure).to.equal(0);
    expect(slippage).to.equal(0);
    expect(tradePrice).to.equal(1);
  });
  it('quote <= order[0].notional', () => {
    const { exposure, slippage, tradePrice } = calcTradeExposure(10, 1, orders)
    expect(exposure).to.equal(10);
    expect(slippage).to.equal(0)
    expect(tradePrice).to.equal(1);

  });
  it('order[0].notional <= quote <= order[1].notional', () => {
    const { exposure, slippage, tradePrice } = calcTradeExposure(20, 1, orders)
    expect(exposure).to.equal(19.0909090909);
    // actual paid price === 1.05
    expect(slippage).to.approximately(0.05, 0.00001)
    expect(tradePrice).to.equal(1.05);
  });
  it('takes all orders', () => {
    // here we are taking 10 orders at 1, 20 at 1.1 and 30 at 1.2
    // round 1 60 - 10 (at $1)
        // 68 - 10 = 58 left over
    // round 2 20 (at $1.1)
        // 58 - (20 * 1.1) = 36 left over
    // round 3 30 at ($1.2)
        // 36 - (30 * 1.2) - 0 left over
    // price should be (10 * 1 + 20 * 1.1 + 30 * 1.2) / 60
    // trade price at 1.133333333
    const { exposure, slippage, tradePrice } = calcTradeExposure(68, 1, orders)
    expect(exposure).to.equal(68)
    expect(slippage).to.approximately(0.133333, 0.00001)
    // 10 0's
    expect(tradePrice).to.equal(1.1333333333333333);
  });
  it('takes all orders and beyond', () => {
    // should be same as above
    const { exposure, slippage, tradePrice } = calcTradeExposure(300, 1, orders)
    expect(exposure).to.equal(68)
    expect(slippage).to.approximately(0.133333, 0.00001)
    // 10 0's
    expect(tradePrice).to.equal(1.1333333333333333);
  });
  it('takes all orders with leverage', () => {
    // should be same as above
    const { exposure, slippage, tradePrice } = calcTradeExposure(34, 2, orders)
    expect(exposure).to.equal(68)
    expect(slippage).to.approximately(0.133333, 0.00001)
    // 10 0's
    expect(tradePrice).to.equal(1.1333333333333333);
  });
});
