import { FlatOrder, FlatOrderWithSide } from "../Types/accounting";
import { BigNumber } from 'bignumber.js';

const RYAN_6 = new BigNumber(6); // a number accredited to our good friend Ryan Garner
const LIQUIDATION_GAS_COST = new BigNumber (25); // When gas price is 250 gwei and eth price is 1700, the liquidation gas cost is 25 USD.
// const LIQUIDATION_PERCENTAGE = 0.075; // liquidation percentage of 7.5%

/**
 * Calculates the leverage multiplier the user currently has based on their position and a given price
 * @returns the leverage of the user at a given position or -1 if the position is invalid this represents infinite leverage
 */
export const calcLeverage: (quote: BigNumber, base: BigNumber, price: BigNumber) => BigNumber = (quote, base, price) => {
    const margin = calcTotalMargin(quote, base, price);
    if (margin.lte(0)) return new BigNumber(-1)
    return calcNotionalValue(base, price).div(margin)
};



/**
 * A function that returns the liquidation price for a given account.
 *  This is the eligible liquidation price. 
 *  Given BTC/USD the quote is USD and the base is BTC
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @param maxLeverage The maximum leverage accounts can trade at. This is specific to the Tracer market
 * @returns the price of the asset where the account is eligible for liquidation
 */
export const calcLiquidationPrice: (quote: BigNumber, base: BigNumber, price: BigNumber, maxLeverage: BigNumber) => BigNumber = (
    quote,
    base,
    price,
    maxLeverage,
) => {
    const borrowed = calcBorrowed(quote, base, price);
    if (borrowed.gt(0) || base.lt(0)) { // if the user has a position
        if (base.gt(0)) { // if the user is long
            return (
                (maxLeverage.times(quote.minus(RYAN_6.times(LIQUIDATION_GAS_COST)))).div(base.minus(maxLeverage.times(base)))
            )
        } else if (base.lt(0)) { // if the user is short
            return (
                (quote.times(maxLeverage).minus(RYAN_6.times(LIQUIDATION_GAS_COST).times(maxLeverage)).div(maxLeverage.times(base).plus(base))).negated() 
            )
        } // impossible case of base === 0 because calcBorrowed will return 0 if base is 0
    } 
    // all else
    return new BigNumber(0);
};

/**
 * A function that returns the proifitble liquidation price for a given account.
 *  This is the profitible liquidation price, ie the price of the asset where a liquidator profits from
 *  the liquidation.
 *  Given BTC/USD the quote is USD and the base is BTC
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @param maxLeverage The maximum leverage accounts can trade at. This is specific to the Tracer market
 * @returns the price of the asset where it is profitible for a liquidator to liquidate the account
 */
export const calcProfitableLiquidationPrice: (
    quote: BigNumber,
    base: BigNumber,
    price: BigNumber,
    maxLeverage: BigNumber,
) => BigNumber = (quote, base, price, maxLeverage) => {
    const borrowed = calcBorrowed(quote, base, price);
    if (borrowed.gt(0) || base.lt(0)) { // if the user has a position
        if (base.gt(0)) { // if the user is long
            return (
                (maxLeverage.times(quote.minus(RYAN_6.times(LIQUIDATION_GAS_COST).minus(LIQUIDATION_GAS_COST)))).div(base.minus(maxLeverage.times(base)))
            )
        } else if (base.lt(0)) { // if the user is short
            return (
                (quote.times(maxLeverage).minus((RYAN_6.times(LIQUIDATION_GAS_COST).minus(LIQUIDATION_GAS_COST)).times(maxLeverage)).div(maxLeverage.times(base).plus(base))).negated() 
            )
        } // impossible case of base === 0 because calcBorrowed will return 0 if base is 0
    } 
    // all else
    return new BigNumber(0);
};

/**
 * Calculates the amount borrowed by an accoun
 *  Given BTC/USD the quote is USD and the base is BTC
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @returns the amount borrowed by an account or 0 if the borrowed amount is negative
 */
export const calcBorrowed: (quote: BigNumber, base: BigNumber, price: BigNumber) => BigNumber = (quote, base, price) =>
    BigNumber.max(0, calcNotionalValue(base, price).minus(calcTotalMargin(quote, base, price)));

/**
 * Calculates the withdrawable amount of quote asset. This will put the account just above
 * the eligible for liquidation price and is not a good position to be in.
 *  Given BTC/USD the quote is USD and the base is BTC
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @param maxLeverage The maximum leverage accounts can trade at. This is specific to the Tracer market
 * @returns the withdrawable amount of quote asset.
 */
export const calcWithdrawable: (quote: BigNumber, base: BigNumber, price: BigNumber, maxLeverage: BigNumber) => BigNumber = (
    quote,
    base,
    price,
    maxLeverage,
) => {
    return calcTotalMargin(quote, base, price).minus((!(base.eq(0)) ? LIQUIDATION_GAS_COST.times(RYAN_6).plus(calcNotionalValue(base, price).div(maxLeverage)) : 0));
};

/**
 * Calculates the notional value of the position
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @returns the notional value of the position
 */
export const calcNotionalValue: (base: BigNumber, price: BigNumber) => BigNumber = (base, price) => {
    return base.abs().times(price)
};

/**
 * Calculates the minimum margin required for a given position and price. This is closely related to the liquidationPrice
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @returns the minimum margin required for an accounts outstanding position. 
 *  An account with minimumMargin are in a position close to liquidation.
 */
export const calcMinimumMargin: (quote: BigNumber, base: BigNumber, price: BigNumber, maxLeverage: BigNumber) => BigNumber = (
    quote,
    base,
    price,
    maxLeverage,
) => {
    const borrowed = calcBorrowed(quote, base, price);
    if (borrowed.gt(0) || base.lt(0)) {
        return (LIQUIDATION_GAS_COST.times(RYAN_6)).plus(calcNotionalValue(base, price).div(maxLeverage));
    } else {
        return new BigNumber(0);
    }
};

/**
 * Total margin of an account given a position
 *  aka equity, the amount owned by the user if they cashed out at the given price
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @returns the total margin of an account
 */
export const calcTotalMargin: (quote: BigNumber, base: BigNumber, price: BigNumber) => BigNumber = (quote, base, price) =>
    (quote.plus(base.times(price))) ?? new BigNumber(0); // return 0 if something goes wrong


/**
 * Calcultes the buying power of a user based on a position
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @param maxLeverage The maximum leverage accounts can trade at. This is specific to the Tracer market
 * @returns the value of the users buying power in quote asset
 */
export const calcBuyingPower: (
    quote: BigNumber,
    base: BigNumber, 
    price: BigNumber, 
    maxLeverage: BigNumber
) => BigNumber = (quote, base, price, maxLeverage) => {
    return BigNumber.max(
        0, 
        (calcTotalMargin(quote, base, price).minus(calcMinimumMargin(quote, base, price, maxLeverage))).times(maxLeverage)
    )
}

/**
 * Calcultes the remaining available margin as a percentage
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @param maxLeverage The maximum leverage accounts can trade at. This is specific to the Tracer market
 * @returns the users remaining available margin as a percentage
 */
export const calcAvailableMarginPercent: (
    quote: BigNumber,
    base: BigNumber, 
    price: BigNumber, 
    maxLeverage: BigNumber
) => BigNumber = (quote, base, price, maxLeverage) => {
    return new BigNumber(1).minus(
    calcMinimumMargin(quote, base, price, maxLeverage).div(calcTotalMargin(quote, base, price))
    ).times(100)
}

/**
 * Calculates a theoretical market exposure if it took all the 'best' orders it could
 *  Returns this exposure and the orders that allow it to gain this exposure
 * @param quote Amount of quote asset
 * @param leverage leverage of the trade this could be passed in as quote leverage * quote
 */
export const calcTradeExposure: (
    quote: BigNumber,
    leverage: BigNumber,
    orders: FlatOrder[],
) => { exposure: BigNumber, slippage: BigNumber, tradePrice: BigNumber} = (quote, leverage, orders) => {
    if (orders.length) {
        // weighted average of the price, where the weights are the amounts at each price
        let exposure = new BigNumber(0),
            sumOfWeights = new BigNumber(0),
            totalUnits = new BigNumber(0);
        let buyingPower = quote.times(leverage); // total units of underlying
        for (const order of orders) {
            const amount = order.amount;
            const orderPrice = order.price;
            // remainding units of accounts quote use
            const r = buyingPower.minus(amount.times(orderPrice));
            if (r.gte(0)) { // if it can eat the whole order
                totalUnits = totalUnits.plus(orderPrice.times(amount));
                sumOfWeights = sumOfWeights.plus(amount);
                exposure = exposure.plus(amount.times(orderPrice)); // units of the assets
                buyingPower = buyingPower.minus(amount.times(orderPrice)); // subtract the remainder in units of underLying
            } else { // eat a bit of the order nom nom
                // if we get here the max amount we can is the remainder of deposit
                if (!buyingPower.eq(0)) {
                    totalUnits = totalUnits.plus(buyingPower.times(orderPrice));
                    sumOfWeights = sumOfWeights.plus(buyingPower);
                    exposure = exposure.plus(buyingPower.div(orderPrice));
                }
                break;
            }
        }
        
        const expectedPrice = orders[0].price;
        // this is a weighted average of the prices and how much was taken at each price
        const tradePrice = !totalUnits.eq(0) ? totalUnits.div(sumOfWeights) : expectedPrice;
        return {
            exposure: exposure,
            slippage: (expectedPrice.minus(tradePrice).abs()).div(expectedPrice),
            tradePrice: tradePrice
        };
    }
    return {
        exposure: new BigNumber(0),
        slippage: new BigNumber(0),
        tradePrice: new BigNumber(0)
    };
};

/**
 * Given a users base (position) and price, calculate the unrealisedPnL
 * by determining their weighted avg buy in price that got them to that position
 * @param base position
 * @param price current price
 * @param previousOrders list of orders taken by user
 * @requires previousOrders to be ordered in descending order of timestamp
 * @requires amount/price of orders to be in standard units
 * @returns the unrealised profit
 */
export const calcUnrealised: (
    base: BigNumber, 
    price: BigNumber, 
    previousOrders: FlatOrderWithSide[]
) => BigNumber = (base, price, previousOrders) => {
    /** Calculate the weighted average trade price */
    if (base.eq(0)) return new BigNumber(0);
    let position = base.lt(0) // false if long, true if short;
    let 
        remainingBase = new BigNumber(base.abs()),
        sumOfAmounts = new BigNumber(0),
        sumOfWeights = new BigNumber(0);
    for (let order of previousOrders) {
        let r = remainingBase.minus(order.amount);
        if (order.position !== position) continue; // skip this round
        if (r.gt(0)) {
            sumOfAmounts = sumOfAmounts.plus(order.amount.times(order.price));
            sumOfWeights = sumOfWeights.plus(order.amount);
            remainingBase = remainingBase.minus(order.amount);
        } else { // r is less than or equal to 0
            sumOfAmounts = sumOfAmounts.plus(remainingBase.times(order.price));
            sumOfWeights = sumOfWeights.plus(remainingBase);
            break;
        }
    }
    if (sumOfWeights.eq(0)) return new BigNumber(0); // exit if no orders
    let avgPrice = sumOfAmounts.div(sumOfWeights);
    return (base.times(price)).minus(base.times(avgPrice));
}
