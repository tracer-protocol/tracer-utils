import { FlatOrder } from "../Types/accounting";

const RYAN_6 = 6; // a number accredited to our good friend Ryan Garner
const LIQUIDATION_GAS_COST = 25; // When gas price is 250 gwei and eth price is 1700, the liquidation gas cost is 25 USD.
// const LIQUIDATION_PERCENTAGE = 0.075; // liquidation percentage of 7.5%

/**
 * Calculates the leverage multiplier the user currently has based on their position and a given price
 */
export const calcLeverage: (quote: number, base: number, price: number) => number = (quote, base, price) => {
    return calcNotionalValue(base, price) / totalMargin(base, quote, price);
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
export const calcLiquidationPrice: (quote: number, base: number, price: number, maxLeverage: number) => number = (
    quote,
    base,
    price,
    maxLeverage,
) => {
    const borrowed = calcBorrowed(quote, base, price);
    if (borrowed > 0 || base < 0) {
        return base > 0 // case 1
            ? (maxLeverage * (quote - RYAN_6 * LIQUIDATION_GAS_COST)) / (base - maxLeverage * base)
            : 0 + base < 0 // case 2
            ? (-1 * (quote * maxLeverage - RYAN_6 * LIQUIDATION_GAS_COST * maxLeverage)) / (maxLeverage * base + base)
            : 0;
    } else {
        return 0;
    }
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
    quote: number,
    base: number,
    price: number,
    maxLeverage: number,
) => number = (quote, base, price, maxLeverage) => {
    const margin = totalMargin(base, quote, price);
    const borrowed = calcBorrowed(quote, base, price);
    if (borrowed > 0 || margin < 0) {
        return quote > 0 // case 1
            ? (maxLeverage * (base - (RYAN_6 * LIQUIDATION_GAS_COST - LIQUIDATION_GAS_COST))) /
                  (quote - maxLeverage * quote)
            : 0 + quote < 0 // case 2
            ? -1 *
              ((base * (maxLeverage - (RYAN_6 * LIQUIDATION_GAS_COST - LIQUIDATION_GAS_COST) * maxLeverage)) /
                  (maxLeverage * quote + quote))
            : 0;
    } else {
        return 0;
    }
};

/**
 * Calculates the amount borrowed by an accoun
 *  Given BTC/USD the quote is USD and the base is BTC
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @returns the amount borrowed by an account or 0 if the borrowed amount is negative
 */
export const calcBorrowed: (quote: number, base: number, price: number) => number = (quote, base, price) =>
    Math.max(0, calcNotionalValue(base, price) - totalMargin(base, quote, price));

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
export const calcWithdrawable: (quote: number, base: number, price: number, maxLeverage: number) => number = (
    quote,
    base,
    price,
    maxLeverage,
) => {
    return totalMargin(base, quote, price) - (base !== 0 ? LIQUIDATION_GAS_COST * RYAN_6 + calcNotionalValue(base, price) / maxLeverage : 0);
};

/**
 * Calculates the notional value of the position
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @returns the notional value of the position
 */
export const calcNotionalValue: (base: number, price: number) => number = (base, price) => {
    return Math.abs(base) * price;
};

/**
 * Calculates the minimum margin required for a given position and price. This is closely related to the liquidationPrice
 * @param quote Amount of quote asset
 * @param base Amount of base asset, this is considered the position of the account
 * @param price The given price of the asset 
 * @returns the minimum margin required for an accounts outstanding position. 
 *  An account with minimumMargin are in a position close to liquidation.
 */
export const calcMinimumMargin: (quote: number, base: number, price: number, maxLeverage: number) => number = (
    quote,
    base,
    price,
    maxLeverage,
) => {
    const margin = totalMargin(base, quote, price);
    if (margin > 0 || base < 0) {
        return LIQUIDATION_GAS_COST * RYAN_6 + calcNotionalValue(base, price) / maxLeverage;
    } else {
        return 0;
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
export const totalMargin: (base: number, quote: number, price: number) => number = (base, quote, price) =>
    quote + base * price;

/**
 * Calculates a theoretical market exposure if it took all the 'best' orders it could
 *  Returns this exposure and the orders that allow it to gain this exposure
 * @param quote Amount of quote asset
 * @param leverage leverage of the trade this could be passed in as quote leverage * quote
 */
export const calcTradeExposure: (
    quote: number,
    leverage: number,
    orders: FlatOrder[],
) => { exposure: number, slippage: number, tradePrice: number } = (quote, leverage, orders) => {
    if (orders.length) {
        // weighted average of the price, where the weights are the amounts at each price
        let exposure = 0,
            sumOfWeights = 0,
            totalUnits = 0;
        let deposit = quote * leverage; // total units of underlying
        for (const order of orders) {
            const amount = order.amount;
            const orderPrice = order.price;
            // remainding units of accounts quote use
            const r = deposit - amount * orderPrice;
            if (r >= 0) { // if it can eat the whole order
                totalUnits += orderPrice * amount;
                sumOfWeights += amount;
                exposure += amount * orderPrice; // units of the assets
                deposit -= amount * orderPrice; // subtract the remainder in units of underLying
            } else { // eat a bit of the order nom nom
                // if we get here the max amount we can is the remainder of deposit
                if (deposit) {
                    totalUnits += deposit * orderPrice;
                    sumOfWeights += deposit;
                    exposure += deposit / orderPrice;
                }
                break;
            }
        }
        
        const expectedPrice = orders[0].price;
        // this is a weighted average of the prices and how much was taken at each price
        const tradePrice = totalUnits ? totalUnits / sumOfWeights: expectedPrice;
        return {
            exposure: parseFloat(exposure.toFixed(10)),
            slippage: 1 - expectedPrice/tradePrice,
            tradePrice: tradePrice
        };
    }
    return {
        exposure: 0,
        slippage: 0,
        tradePrice: 0,
    };
};