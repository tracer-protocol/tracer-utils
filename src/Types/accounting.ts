import BigNumber from "bignumber.js";


export type FlatOrder = {
    price: BigNumber,
    amount: BigNumber,
}

// position is false if long
export type FlatOrderWithSide = FlatOrder & { position: boolean }