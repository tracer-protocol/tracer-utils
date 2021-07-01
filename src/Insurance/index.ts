import BigNumber from "bignumber.js";

const HOURLY_COMPOUND_FREQUENCY = new BigNumber(24*365); // hourly insurance funding rate
// const EIGHT_HOURLY_COMPOUND_FREQUENCY = new BigNumber(3*365); // hourly insurance funding rate
const ONE = new BigNumber(1);

/**
 * Calculates the APY for an insurance pool
 * @param fundingRate current insurance funding rate as a decimal percentage
 * @param insuranceFundHoldings total holdings within the insurance pool
 * @param leveragedNotionalValue borrowings from the tracer market
 * @returns an APY decimal percentage
 */
export const calcInsuranceAPY = (fundingRate: BigNumber, insuranceFundHoldings: BigNumber, leveragedNotionalValue: BigNumber) => {
	const apr = calcInsuranceAPR(fundingRate, insuranceFundHoldings, leveragedNotionalValue);
	return (
		((ONE.plus(apr.div(HOURLY_COMPOUND_FREQUENCY))).pow(HOURLY_COMPOUND_FREQUENCY))
		.minus(ONE)
	)
}

/**
 * Calculates the APR for an insurance pool
 * @param fundingRate current insurance funding rate as a decimal percent
 * @param insuranceFundHoldings total holdings within the insurance pool
 * @param leveragedNotionalValue borrowings from the tracer market
 * @returns an APR decimal percentage
 */
export const calcInsuranceAPR = (fundingRate: BigNumber, insuranceFundHoldings: BigNumber, leveragedNotionalValue: BigNumber) => {
	return (
		(leveragedNotionalValue.times(fundingRate.times(HOURLY_COMPOUND_FREQUENCY))
			.div(insuranceFundHoldings))
	)
}