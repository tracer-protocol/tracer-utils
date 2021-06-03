import BigNumber from "bignumber.js";


export type FlatOrder = {
    price: BigNumber,
    amount: BigNumber,
}

// side is false if long
export type FlatOrderWithSide = FlatOrder & { side: boolean }