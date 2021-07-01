/**
 * Refactored Accounting functions
 * 
 */
import { PositionVars } from '../Types/calculator';

import BigNumber from "bignumber.js";
import { LIQUIDATION_GAS_COST, RYAN_6 } from '../Accounting';


const BUFFER = (RYAN_6.times(LIQUIDATION_GAS_COST)).minus(LIQUIDATION_GAS_COST)
const ONE = new BigNumber(1);

/**
 * Calculate liquidationPrice and margin given an exposure and leverage
 * 
 * @param exposure desired exposure of the base asset
 * @param leverage desired leverage
 * @param price current price
 * @param maxLeverage maximum leverage of tracer
 * @param isLong is the calculation for a long position
 * @returns returns an object containing { exposure, liquidationPrice, margin, leverage}
 */
export const calcFromExposureAndLeverage: (
	exposure: BigNumber, 
	leverage: BigNumber, 
	price: BigNumber,
	maxLeverage: BigNumber,
	isLong: boolean
) => PositionVars = (exposure, leverage, price, maxLeverage, isLong) => {
	let base = exposure;
	const notional = exposure.times(price);
	const margin = notional.div(leverage);
	let quote = margin.minus(notional);
	let liquidationPrice = maxLeverage.times(quote.minus(BUFFER)).div(base.minus(maxLeverage.times(base)));
	if (isLong) {
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: exposure
		});
	} else {
		base = base.negated()
		quote = margin.minus(base.times(price));
		liquidationPrice = maxLeverage.negated().times(quote.minus(BUFFER)).div(base.plus(maxLeverage.times(base)))
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: exposure
		});
	}
}

/**
 * 
 * @param exposure 
 * @param margin 
 * @param price 
 * @param maxLeverage 
 * @param isLong is the calculation for a long position
 * @returns returns an object containing { exposure, liquidationPrice, margin, leverage}
 */
export const calcFromExposureAndMargin: (
	exposure: BigNumber, 
	margin: BigNumber, 
	price: BigNumber,
	maxLeverage: BigNumber,
	isLong: boolean
) => PositionVars = (exposure, margin, price, maxLeverage, isLong) => {
	let base = exposure;
	let notional = base.times(price);
	const leverage = notional.div(margin);
	let quote = margin.minus(notional)
	let liquidationPrice = maxLeverage.times(quote.minus(BUFFER)).div(base.minus(maxLeverage.times(base)))
	if (isLong) {
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: exposure
		});
	} else {
		base = exposure.negated();
		notional = base.times(price);
		quote = margin.minus(notional)
		liquidationPrice = maxLeverage.times(quote.minus(BUFFER)).div(base.plus(maxLeverage.times(base))).negated();
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: exposure
		});
	}
}

/**
 * 
 * This calculates webbys sack size
 * 
 * @param exposure 
 * @param liquidationPrice 
 * @param price 
 * @param maxLeverage 
 * @param isLong is the calculation for a long position
 * @returns returns an object containing { exposure, liquidationPrice, margin, leverage}
 */
export const calcFromExposureAndLiquidation: (
	exposure: BigNumber, 
	liquidationPrice: BigNumber,
	price: BigNumber,
	maxLeverage: BigNumber,
	isLong: boolean
) => PositionVars = (exposure, liquidationPrice, price, maxLeverage, isLong) => {
	if (isLong) {
		const notional = exposure.times(price);
		const quote = 
			((liquidationPrice.div(maxLeverage))
			.times(exposure.minus(maxLeverage.times(exposure)))).plus(BUFFER);
		const leverage = notional.div(notional.plus(quote));
		const margin = notional.div(leverage);
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: exposure
		})
	} else {
		const base = exposure.negated();
		const notional = base.times(price);
		const quote = 
			((liquidationPrice.negated().div(maxLeverage))
			.times(base.plus(maxLeverage.times(base)))).plus(BUFFER);
		const margin = notional.plus(quote);
		const leverage = exposure.times(price).div(margin);
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: exposure
		})
	}
}

/**
 * 
 * @param margin 
 * @param leverage 
 * @param price 
 * @param maxLeverage 
 * @param isLong is the calculation for a long position
 * @returns returns an object containing { exposure, liquidationPrice, margin, leverage}
 */
export const calcFromMarginAndLeverage: (
	margin: BigNumber, 
	leverage: BigNumber,
	price: BigNumber,
	maxLeverage: BigNumber,
	isLong: boolean
) => PositionVars = (margin, leverage, price, maxLeverage, isLong) => {
	const notional = margin.times(leverage);
	if (isLong) {
		const base = notional.div(price);
		const quote = margin.minus(notional)
		const liquidationPrice = 
			maxLeverage.times(quote.minus(BUFFER))
			.div(base.minus(maxLeverage.times(base)))

		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: base 
		})
	} else {
		const base = notional.negated().div(price);
		const quote = margin.plus(notional);
		const liquidationPrice = 
			maxLeverage.negated().times(quote.minus(BUFFER))
			.div(base.plus(maxLeverage.times(base)))
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: base.abs() 
		})
	}
}

/**
 * 
 * @param leverage 
 * @param liquidationPrice 
 * @param price 
 * @param maxLeverage 
 * @param isLong is the calculation for a long position
 * @returns returns an object containing { exposure, liquidationPrice, margin, leverage}
 */
export const calcFromLeverageAndLiquidation: (
	leverage: BigNumber, 
	liquidationPrice: BigNumber,
	price: BigNumber,
	maxLeverage: BigNumber,
	isLong: boolean
) => PositionVars = (leverage, liquidationPrice, price, maxLeverage, isLong) => {
	const one = new BigNumber(1);
	if (isLong) {
		const base = 
			(leverage.times(BUFFER))
			.div(price.minus(leverage.times(price.plus((liquidationPrice.div(maxLeverage)).times(one.minus(maxLeverage))))))
		const quote = BUFFER.plus((liquidationPrice.div(maxLeverage)).times(base.minus(maxLeverage.times(base))))
		const margin = quote.plus(base.times(price))
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: base 
		})
	} else {
		const base = 
			(leverage.times(BUFFER))
			.div(price.minus(leverage.times(price.plus((liquidationPrice.negated().div(maxLeverage)).times(one.plus(maxLeverage))))))
		const quote = BUFFER.plus((liquidationPrice.negated().div(maxLeverage)).times(base.plus(maxLeverage.times(base))))
		const margin = quote.plus(base.times(price))
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: base 
		})

	}
}

/**
 * 
 * @param margin 
 * @param liquidationPrice 
 * @param price 
 * @param maxLeverage 
 * @param isLong is the calculation for a long position
 * @returns returns an object containing { exposure, liquidationPrice, margin, leverage}
 */
export const calcFromMarginAndLiquidation: (
	margin: BigNumber, 
	liquidationPrice: BigNumber,
	price: BigNumber,
	maxLeverage: BigNumber,
	isLong: boolean
) => PositionVars = (margin, liquidationPrice, price, maxLeverage, isLong) => {
	if (isLong) {
		const base = 
			(margin.minus(BUFFER))
			.div(price.plus(liquidationPrice.times(ONE.minus(maxLeverage)).div(maxLeverage)))
		const notional = base.times(price);
		const leverage = notional.div(margin);
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: base 
		})
	} else {
		const base = 
			(margin.minus(BUFFER))
			.div(price.plus(liquidationPrice.negated().times(ONE.plus(maxLeverage).div(maxLeverage))))
		const notional = base.times(price).abs();
		const leverage = notional.div(margin);
		return ({
			leverage: leverage,
			liquidationPrice: liquidationPrice,
			margin: margin,
			exposure: base.abs()
		})

	}
}