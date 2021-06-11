import BigNumber from "bignumber.js";

export type PositionVars = {
	leverage: BigNumber,
	liquidationPrice: BigNumber,
	margin: BigNumber,
	exposure: BigNumber 
    
}