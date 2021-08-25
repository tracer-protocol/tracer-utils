var chai = require('chai');
var { expect } = chai;

//use default BigNumber
chai.use(require('chai-bignumber')());


import {
  calcTradeExposureFromQuoteAndLeverage,
  calcBorrowed,
  calcTotalMargin,
  calcMinimumMargin,
  calcWithdrawable,
  calcNotionalValue,
  calcLeverage,
  calcUnrealised,
  calcPositionAfterTrade,
  calcFee,
  calcFundingRatePayment,
  calcInsuranceFundingRatePayment
  // calcLiquidationPrice,
  // calcProfitableLiquidationPrice,
} from "../src/Accounting"

import { BigNumber } from 'bignumber.js';

// Basic positions
// The user holds a position not in liquidation
// Deposit 200 at $100, short 10 units
const position1 = {
  quote: new BigNumber(1200), base: new BigNumber(-10), price: new BigNumber(100), maxLeverage: new BigNumber(50)
}
// 25 leverage
const position2 = {
  quote: new BigNumber(-9600), base: new BigNumber(100), price: new BigNumber(100), maxLeverage: new BigNumber(50)
}
// Invalid positions
// The user holds a position and can be liquidated
// no margin
const invalid1 = {
  quote: new BigNumber(-1000), base: new BigNumber(10), price: new BigNumber(100), maxLeverage: new BigNumber(50)
}
// not enough margin due to liquidation gas prices
// is actually a valid position otherwise
const invalid2 = {
  quote: new BigNumber(2050), base: new BigNumber(-20), price: new BigNumber(100), maxLeverage: new BigNumber(50)
}

const orders = [
    {
        amount: new BigNumber(10),
        price: new BigNumber(1)
    },
    {
        amount: new BigNumber(20),
        price: new BigNumber(1.1)
    },
    {
        amount: new BigNumber(30),
        price: new BigNumber(1.2)
    }
]

const noShorts = [
    {
        amount: new BigNumber(10),
        price: new BigNumber(100),
        position: false
    },
    {
        amount: new BigNumber(10),
        price: new BigNumber(110),
        position: false
    },
]
const pnlOrders  = [
    {
        amount: new BigNumber(10),
        price: new BigNumber(100),
        position: false
    },
    {
        amount: new BigNumber(10),
        price: new BigNumber(110),
        position: false
    },
    {
        amount: new BigNumber(20),
        price: new BigNumber(120),
        position: false
    },
    {
        amount: new BigNumber(10),
        price: new BigNumber(100),
        position: true
    },
    {
        amount: new BigNumber(10),
        price: new BigNumber(110),
        position: true
    },
    {
        amount: new BigNumber(20),
        price: new BigNumber(120),
        position: true
    }
]


describe.skip('calcTradeExposureFromQuoteAndLeverage', () => {
  it('no orders', () => {
    const { exposure, slippage, tradePrice } = calcTradeExposureFromQuoteAndLeverage(new BigNumber(0), new BigNumber(1), [])
    expect(exposure).to.be.bignumber.equal(0);
    expect(slippage).to.be.bignumber.equal(0);
    expect(tradePrice).to.be.bignumber.equal(0);
  });

  it('no margin, no exposure', () => {
    const { exposure, slippage, tradePrice } = calcTradeExposureFromQuoteAndLeverage(new BigNumber(0), new BigNumber(1), orders)
    expect(exposure).to.be.bignumber.equal(0);
    expect(slippage).to.be.bignumber.equal(0);
    expect(tradePrice).to.be.bignumber.equal(1);
  });
  it('quote <= order[0].notional', () => {
    const { exposure, slippage, tradePrice } = calcTradeExposureFromQuoteAndLeverage(new BigNumber(10), new BigNumber(1), orders)
    expect(exposure).to.be.bignumber.equal(10);
    expect(slippage).to.be.bignumber.equal(0)
    expect(tradePrice).to.be.bignumber.equal(1);

  });
  it('order[0].notional <= quote <= order[1].notional', () => {
    const { exposure, slippage, tradePrice } = calcTradeExposureFromQuoteAndLeverage(new BigNumber(20), new BigNumber(1), orders)
    expect(exposure.toNumber()).to.be.bignumber.equal(19.09090909090909);
    // actual paid price === 1.05
    expect(slippage).to.be.bignumber.equal(0.05)
    expect(tradePrice).to.be.bignumber.equal(1.05);
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
    const { exposure, slippage, tradePrice } = calcTradeExposureFromQuoteAndLeverage(new BigNumber(68), new BigNumber(1), orders)
    expect(exposure).to.be.bignumber.equal(68)
    expect(slippage).to.be.bignumber.equal(new BigNumber('0.13333333333333333333'))
    // 10 0's
    expect(tradePrice).to.be.bignumber.equal(new BigNumber('1.13333333333333333333'));
  });
  it('takes all orders and beyond', () => {
    // should be same as above
    const { exposure, slippage, tradePrice } = calcTradeExposureFromQuoteAndLeverage(new BigNumber(300), new BigNumber(1), orders)
    expect(exposure).to.be.bignumber.equal(68)
    expect(slippage).to.be.bignumber.equal(new BigNumber('0.13333333333333333333'))
    // 10 0's
    expect(tradePrice).to.be.bignumber.equal(new BigNumber('1.13333333333333333333'));
  });
  it('takes all orders with leverage', () => {
    // should be same as above
    const { exposure, slippage, tradePrice } = calcTradeExposureFromQuoteAndLeverage(new BigNumber(34), new BigNumber(2), orders)
    expect(exposure).to.be.bignumber.equal(68)
    expect(slippage).to.be.bignumber.equal(new BigNumber('0.13333333333333333333'))
    // 10 0's
    expect(tradePrice).to.be.bignumber.equal(new BigNumber('1.13333333333333333333'));
  });
});

describe.skip("Testing margin", () => {
  it('Basic Positions', () => {
    expect(calcTotalMargin(position1.quote, position1.base, position1.price), 'Position 1').to.be.bignumber.equal(200)
    expect(calcTotalMargin(position2.quote, position2.base, position2.price), 'Position 2').to.be.bignumber.equal(400)
  })
  it('Invalid Positions', () => {
    expect(calcTotalMargin(invalid1.quote, invalid1.base, invalid1.price), 'Invalid 1').to.be.bignumber.equal(0)
    expect(calcTotalMargin(invalid2.quote, invalid2.base, invalid2.price), 'Invalid 2').to.be.bignumber.equal(50)
  })
})

describe.skip("Testing calcNotional", () => {
  it('Basic Position', () => {
    expect(calcNotionalValue(position1.base, position1.price), "Position 1").to.be.bignumber.equal(1000)
    expect(calcNotionalValue(position2.base, position2.price), 'Position 2').to.be.bignumber.equal(10000)
  })
  it('Invalid Positions', () => {
    expect(calcNotionalValue(invalid1.base, invalid1.price), 'Invalid 1').to.be.bignumber.equal(1000)
    expect(calcNotionalValue(invalid2.base, invalid2.price), 'Invalid 2').to.be.bignumber.equal(2000)
  })
})

describe.skip("Testing Minimum margin", () => {
  it('Basic Positions', () => {
    expect(calcMinimumMargin(position1.quote, position1.base, position1.price, position1.maxLeverage), 'Position 1').to.be.bignumber.equal(170)
    expect(calcMinimumMargin(position2.quote, position2.base, position2.price, position2.maxLeverage), 'Position 2').to.be.bignumber.equal(350)
  })
  it('Invalid Positions', () => {
    expect(calcMinimumMargin(invalid1.quote, invalid1.base, invalid1.price, invalid1.maxLeverage), 'Invalid 1').to.be.bignumber.equal(170)
    expect(calcMinimumMargin(invalid2.quote, invalid2.base, invalid2.price, invalid2.maxLeverage), 'Invalid 2').to.be.bignumber.equal(190)
  })
})

describe.skip("Testing calcBorrowed", () => {
  it('Basic Positions', () => {
    expect(calcBorrowed(position1.quote, position1.base, position1.price), 'Position 1').to.be.bignumber.equal(800)
    expect(calcBorrowed(position2.quote, position2.base, position2.price), 'Position 2').to.be.bignumber.equal(9600)
  })
  it('Invalid Positions', () => {
    expect(calcBorrowed(invalid1.quote, invalid1.base, invalid1.price), 'Invalid 1').to.be.bignumber.equal(1000)
    expect(calcBorrowed(invalid2.quote, invalid2.base, invalid2.price), 'Invalid 2').to.be.bignumber.equal(1950)
  })
})

describe("Testing calcLeverage", () => {
  it('Basic Positions', () => {
    expect(calcLeverage(position1.quote, position1.base, position1.price), 'Position 1').to.be.bignumber.equal(5)
    expect(calcLeverage(position2.quote, position2.base, position2.price), 'Position 2').to.be.bignumber.equal(25)
  })
  it('Invalid Positions', () => {
    expect(calcLeverage(invalid1.quote, invalid1.base, invalid1.price), 'Invalid 1').to.be.bignumber.equal(0)
    expect(calcLeverage(invalid2.quote, invalid2.base, invalid2.price), 'Invalid 2').to.bignumber.equal(40)
  })
})

describe.skip("Testing liquidationPrice", () => {
  it('Basic Positions', () => {
    // expect(calcLiquidationPrice(position1.quote, position1.base, position1.price, position1.maxLeverage), "Position 1").to.be.bignumber.approximately(102.941, 0.001)
    // expect(calcLiquidationPrice(position2.quote, position2.base, position2.price, position2.maxLeverage), 'Position 2').to.be.bignumber.approximately(99.490, 0.001)
  })
  it('Invalid Positions', () => {
    // since this is long they are already in liquidation
    // expect(calcLiquidationPrice(invalid1.quote, invalid1.base, invalid1.price, invalid1.maxLeverage), 'Invalid 1').to.be.bignumber.approximately(117.347, 0.001)
    // expect(calcLiquidationPrice(invalid2.quote, invalid2.base, invalid2.price, invalid2.maxLeverage), 'Invalid 2').to.be.bignumber.approximately(93.137, 0.001)
  })
})

describe.skip("Testing profitableForLiquidationPrice", () => {
  it('Basic Positions', () => {
    // expect(calcProfitableLiquidationPrice(position1.quote, position1.base, position1.price, position1.maxLeverage), "Position 1").to.be.bignumber.approximately(105.392, 0.001)
    // expect(calcProfitableLiquidationPrice(position2.quote, position2.base, position2.price, position2.maxLeverage), 'Position 2').to.be.bignumber.approximately(99.235, 0.001)
  })
  it('Invalid Positions', () => {
    // since this is long they are already in liquidation
    // expect(calcProfitableLiquidationPrice(invalid1.quote, invalid1.base, invalid1.price, invalid1.maxLeverage), 'Invalid 1').to.be.bignumber.approximately(114.796, 0.001)
    // expect(calcProfitableLiquidationPrice(invalid2.quote, invalid2.base, invalid2.price, invalid2.maxLeverage), 'Invalid 2').to.be.bignumber.approximately(94.363, 0.001)
  })
})

describe.skip('Testing Withdrawable', () => {
  it('Basic Positions', () => {
    expect(calcWithdrawable(position1.quote, position1.base, position1.price, position1.maxLeverage), 'Position 1').to.be.bignumber.equal(30)
    expect(calcWithdrawable(position2.quote, position2.base, position2.price, position2.maxLeverage), 'Position 2').to.be.bignumber.equal(50)
  })
  it('Invalid Positions', () => {
    // they cannot withdraw anything
    expect(calcWithdrawable(invalid1.quote, invalid1.base, invalid1.price, invalid1.maxLeverage), 'Invalid 1').to.be.bignumber.equal(-170)
    expect(calcWithdrawable(invalid2.quote, invalid2.base, invalid2.price, invalid2.maxLeverage), 'Invalid 2').to.be.bignumber.equal(-140)
  })
})

describe.skip('Testing CalcUnrealised', () => {
  it('Basic Positions', () => {
    let long = new BigNumber(10);
    let short = long.negated()
    // no base
    expect(calcUnrealised(new BigNumber(0), position1.price, pnlOrders), 'Short 10 units').to.be.bignumber.equal(0)
    // no shorts
    expect(calcUnrealised(short, position1.price, noShorts), 'No short orders').to.be.bignumber.equal(0)
    // avgPrice should be 100
    expect(calcUnrealised(short, position1.price, pnlOrders), 'Short 10 units').to.be.bignumber.equal(0)
    expect(calcUnrealised(short, new BigNumber(110), pnlOrders), 'Short 10 units, Price 110').to.be.bignumber.equal(-100)
    expect(calcUnrealised(short, new BigNumber(90), pnlOrders), 'Short 10 units, Price 90').to.be.bignumber.equal(100)
    expect(calcUnrealised(long, position1.price, pnlOrders), 'Long 10 units').to.be.bignumber.equal(0)
    expect(calcUnrealised(long, new BigNumber(110), pnlOrders), 'Long 10 units, Price 110').to.be.bignumber.equal(100)
    expect(calcUnrealised(long, new BigNumber(90), pnlOrders), 'Long 10 units, Price 90').to.be.bignumber.equal(-100)

    // avg price should be 105
    expect(calcUnrealised(short.times(2), position1.price, pnlOrders), 'Short 20 units').to.be.bignumber.equal(100)
    expect(calcUnrealised(short.times(2), new BigNumber(110), pnlOrders), 'Short 20 units, Price 110').to.be.bignumber.equal(-100)
    expect(calcUnrealised(short.times(2), new BigNumber(90), pnlOrders), 'Short 20 units, Price 90').to.be.bignumber.equal(300)
    expect(calcUnrealised(long.times(2), position1.price, pnlOrders), 'Long 20 units').to.be.bignumber.equal(-100)
    expect(calcUnrealised(long.times(2), new BigNumber(110), pnlOrders), 'Long 20 units, Price 110').to.be.bignumber.equal(100)
    expect(calcUnrealised(long.times(2), new BigNumber(90), pnlOrders), 'Long 20 units, Price 90').to.be.bignumber.equal(-300)

    // avg price should be 110
    expect(calcUnrealised(short.times(3), position1.price, pnlOrders), 'Short 30 units').to.be.bignumber.equal(300)
    expect(calcUnrealised(short.times(3), new BigNumber(110), pnlOrders), 'Short 30 units, Price 110').to.be.bignumber.equal(0)
    expect(calcUnrealised(short.times(3), new BigNumber(90), pnlOrders), 'Short 30 units, Price 90').to.be.bignumber.equal(600)
    expect(calcUnrealised(long.times(3), position1.price, pnlOrders), 'Long 30 units').to.be.bignumber.equal(-300)
    expect(calcUnrealised(long.times(3), new BigNumber(110), pnlOrders), 'Long 30 units, Price 110').to.be.bignumber.equal(0)
    expect(calcUnrealised(long.times(3), new BigNumber(90), pnlOrders), 'Long 30 units, Price 90').to.be.bignumber.equal(-600)
  })
})

describe('calcPositionAfterTrade', () => {
  it('Calculates applying a long position', () => {

    const newPosition = calcPositionAfterTrade({
      quote: new BigNumber('10000'),
      base: new BigNumber('1')
    }, {
      amount: new BigNumber('1'),
      price: new BigNumber('5000'),
      position: false // long
    }, new BigNumber('0.02')) // 2%

    expect(newPosition.base).to.eql(new BigNumber('2'))
    expect(newPosition.quote).to.eql(new BigNumber('4900')) // 2% fee on $5000 = $100
  })

  it('Calculates applying a short position', () => {

    const newPosition = calcPositionAfterTrade({
      quote: new BigNumber('10000'),
      base: new BigNumber('1')
    }, {
      amount: new BigNumber('1'),
      price: new BigNumber('5000'),
      position: true // short
    }, new BigNumber('0.02')) // 2%

    expect(newPosition.base).to.eql(new BigNumber('0'))
    expect(newPosition.quote).to.eql(new BigNumber('14900')) // 2% fee on $5000 = $100
  })
})

describe('calcFee', () => {
  it('Calculates a 2% fee', () => {

    const fee = calcFee(
      new BigNumber('2'),
      new BigNumber('5000'),
      new BigNumber('0.02') // 2%
    )

    // 2 units at 5000 each = 10000
    // 2% of 10000 = 200
    expect(fee).to.eql(new BigNumber('200'))
  })
})

describe("applyFunding", async () => {
    context(
        "When the global rate is greater than the user rate & user has a long position",
        async () => {
            it("applies a negative change to the user's position", async () => {
                const quote = new BigNumber(0);
                const base = new BigNumber(50);

                const globalCumulativeRate = new BigNumber(2300);
                const userCumulativeRate = new BigNumber(2200);

				// Funding applied (i.e. quote diff) will be (50 base * (100 quote / base) = 5000 quote
				// Since user had zero quote, they should have -5000 now (take negative of funding applied)
				const newPosition = quote.minus(calcFundingRatePayment(base, globalCumulativeRate, userCumulativeRate))
                expect(newPosition).to.eql(
					new BigNumber(-5000)
                )
            })
        }
    )

    context(
        "When the global rate is less than the user rate & user has a long position",
        async () => {
            it("applies a positive change to the user's position", async () => {
                const quote = new BigNumber(0);
                const base = new BigNumber(50);

                const globalCumulativeRate = new BigNumber(2200);
                const userCumulativeRate = new BigNumber(2300);

                // Funding applied (i.e. quote diff) will be (50 base * (100 quote / base) = -5000 quote
                // Since user had zero quote, they should have 5000 now (take negative of funding applied)
				const newQuote = quote.minus(calcFundingRatePayment(base, globalCumulativeRate, userCumulativeRate))
                expect(newQuote).to.eql(
                    new BigNumber(5000)
                )
            })
        }
    )

    context(
        "When the global rate is greater than the user rate & user has a short position",
        async () => {
            it("applies a positive change to the user's position", async () => {
                const quote = new BigNumber(0);
                const base = new BigNumber(-50);

                const globalCumulativeRate = new BigNumber(2300);
                const userCumulativeRate = new BigNumber(2200);

                // Funding applied (i.e. quote diff) will be (-50 base * (100 quote / base) = -5000 quote
                // Since user had zero quote, they should have 5000 now (take negative of funding applied)
				const newQuote = quote.minus(calcFundingRatePayment(base, globalCumulativeRate, userCumulativeRate))
                expect(newQuote).to.eql(
                    new BigNumber(5000)
                )
            })
        }
    )

    context(
        "When the global rate is less than the user rate & user has a short position",
        async () => {
            it("applies a negative change to the user's position", async () => {
                const quote = new BigNumber(0);
                const base = new BigNumber(-50);

                const globalCumulativeRate = new BigNumber(2200);
                const userCumulativeRate = new BigNumber(2300);

                // Funding applied (i.e. quote diff) will be (-50 base * (-100 quote / base) = 5000 quote
                // Since user had zero quote, they should have -5000 now (take negative of funding applied)
				const newQuote = quote.minus(calcFundingRatePayment(base, globalCumulativeRate, userCumulativeRate))
                expect(newQuote).to.eql(
                    new BigNumber(-5000)
                )
            })
        }
    )
})

describe("applyInsurance", async () => {
	context("when insurance funding has increased", async () => {
		it("returns the correct insurance/user positions", async () => {
			const quote = new BigNumber(0);
			const base = new BigNumber(110);

			const insuranceGlobalRate = {
				globalFundingRate: new BigNumber(10),
				userFundingRate: new BigNumber(5)
			} 

			// this funding rate is the amount that will get the balance to
			// totalLeveraged value of 100
			const fundingRate = {
				globalFundingRate: new BigNumber(10+(1/11)),
				userFundingRate: new BigNumber(10)
			}

			const fairPrice = new BigNumber(1);
			
			// expected change in quote = (insurance rate - user rate) * leveraged value
			// (10 - 5) * 100 = 500
			const newQuote = quote.minus(calcInsuranceFundingRatePayment(
				quote, base, fairPrice, fundingRate, insuranceGlobalRate
			))
			console.log(newQuote.toNumber())

			expect(newQuote).to.be.equal(
				new BigNumber(-500)
			)


			// let expectedUserPosition = [
			// 	ethers.utils.parseEther("-500"),
			// 	ethers.utils.parseEther("110"),
			// ]
			// let expectedInsurancePosition = [
			// 	ethers.utils.parseEther("500"),
			// 	ethers.utils.parseEther("0"),
			// ]

			// let result = await libPrices.applyInsurance(
			// 	userPosition,
			// 	insurancePosition,
			// 	insuranceGlobalRate,
			// 	insuranceUserRate,
			// 	totalLeveragedValue
			// )
			// let newUserPosition = result[0]
			// let newInsurancePosition = result[1]

			// await expect(newUserPosition[0]).to.be.equal(
			// 	expectedUserPosition[0]
			// )
			// await expect(newUserPosition[1]).to.be.equal(
			// 	expectedUserPosition[1]
			// )
			// await expect(newInsurancePosition[0]).to.be.equal(
			// 	expectedInsurancePosition[0]
			// )
			// await expect(newInsurancePosition[1]).to.be.equal(
			// 	expectedInsurancePosition[1]
			// )
		})
	})

	// context("when insurance funding has decreased", async () => {
	// 	it("does not change user positions", async () => {
	// 		let userPosition = [
	// 			ethers.utils.parseEther("0"),
	// 			ethers.utils.parseEther("110"),
	// 		] // quote, base
	// 		let insurancePosition = [
	// 			ethers.utils.parseEther("0"),
	// 			ethers.utils.parseEther("0"),
	// 		] // quote, base
	// 		let insuranceGlobalRate = [0, 0, ethers.utils.parseEther("2")] // timestamp, fundingRate, cumulativeFundingRate
	// 		let insuranceUserRate = [0, 0, ethers.utils.parseEther("5")] // timestamp, fundingRate, cumulativeFundingRate
	// 		let totalLeveragedValue = ethers.utils.parseEther("100")

	// 		let result = await libPrices.applyInsurance(
	// 			userPosition,
	// 			insurancePosition,
	// 			insuranceGlobalRate,
	// 			insuranceUserRate,
	// 			totalLeveragedValue
	// 		)
	// 		let newUserPosition = result[0]
	// 		let newInsurancePosition = result[1]

	// 		await expect(newUserPosition[0]).to.be.equal(userPosition[0])
	// 		await expect(newUserPosition[1]).to.be.equal(userPosition[1])
	// 		await expect(newInsurancePosition[0]).to.be.equal(
	// 			insurancePosition[0]
	// 		)
	// 		await expect(newInsurancePosition[1]).to.be.equal(
	// 			insurancePosition[1]
	// 		)
	// 	})
	// })
})