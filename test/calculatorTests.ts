var chai = require('chai');
var { expect } = chai;

//use default BigNumber
chai.use(require('chai-bignumber')());

import { BigNumber } from 'bignumber.js';
import { 
	calcFromExposureAndLeverage, 
	calcFromExposureAndMargin,
	calcFromLeverageAndLiquidation,
  calcFromExposureAndLiquidation,
  calcFromMarginAndLeverage,
  calcFromMarginAndLiquidation
} from '../src/Calculator';

const price = new BigNumber(100);
const lilPrice = new BigNumber(1);
const MAX_LEVERAGE = new BigNumber(50);
const LONG = true;
const SHORT = false;

const one = new BigNumber(1);
const five = new BigNumber(5);
const oneThousand = new BigNumber(1000);

/** EXPOSURE AND LEVERAGE */
describe('calcFromExposureAndLeverage', () => {
  it('lilPrice at 5x long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndLeverage(oneThousand, five, lilPrice, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(1000);
    expect(leverage).to.be.bignumber.equal(5);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('0.94387755102040816327'));
    expect(margin).to.be.bignumber.equal(200);
  });
  it('bigPrice at 2x long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndLeverage(one.times(10), one.times(2), price , MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(10);
    expect(leverage).to.be.bignumber.equal(2);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('63.77551020408163265306'));
    expect(margin).to.be.bignumber.equal(500);
  });
  it('lilPrice at 5x short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndLeverage(oneThousand, five, lilPrice, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(1000);
    expect(leverage).to.be.bignumber.equal(5);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('1.05392156862745098039'));
    expect(margin).to.be.bignumber.equal(200);
  });
  it('bigPrice at 2x short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndLeverage(one.times(10), one.times(2), price , MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(10);
    expect(leverage).to.be.bignumber.equal(2);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('134.80392156862745098039'));
    expect(margin).to.be.bignumber.equal(500);
  });
})

/** EXPOSURE AND MARGIN */
describe('calcFromExposureAndMargin', () => {
  it('lilPrice for 20 ETH deposit 1 long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndMargin(new BigNumber(20), new BigNumber(1), lilPrice, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(20);
    expect(leverage).to.be.bignumber.equal(20);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('7.34693877551020408163'));
    expect(margin).to.be.bignumber.equal(1);
  });
  it('bigPrice at 1x long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndMargin(new BigNumber(1), new BigNumber(100), price , MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(1);
    expect(leverage).to.be.bignumber.equal(1);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('127.55102040816326530612'));
    expect(margin).to.be.bignumber.equal(100);
  });
  it('lilPrice for 20 ETH deposit 1 short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndMargin(new BigNumber(20), new BigNumber(1), lilPrice, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(20);
    expect(leverage).to.be.bignumber.equal(20);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('-5.0980392156862745098'));
    expect(margin).to.be.bignumber.equal(1);
  });
  it('bigPrice at 1x short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndMargin(new BigNumber(1), new BigNumber(100), price , MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(1);
    expect(leverage).to.be.bignumber.equal(1);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('73.52941176470588235294'));
    expect(margin).to.be.bignumber.equal(100);
  });
})

/** LEVERAGE AND LIQUIDATION */
describe('calcFromLeverageAndLiquidation', () => {
  it('lilPrice at 35x long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromLeverageAndLiquidation(new BigNumber(35), new BigNumber(120), lilPrice, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(new BigNumber('1.07177853993140617344'));
    expect(leverage).to.be.bignumber.equal(35);
    expect(liquidationPrice).to.be.bignumber.equal(120);
    expect(margin).to.be.bignumber.equal(new BigNumber('0.030622243998040176896'));
  });
  it('price at 120 liquidation 40x long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromLeverageAndLiquidation(new BigNumber(40), new BigNumber(120), price, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(new BigNumber('6.2189054726368159204'));
    expect(leverage).to.be.bignumber.equal(40);
    expect(liquidationPrice).to.be.bignumber.equal(120);
    expect(margin).to.be.bignumber.equal(new BigNumber('15.54726368159203980096'));
  });
  it('lilPrice at 35x short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromLeverageAndLiquidation(new BigNumber(35), new BigNumber(120), lilPrice, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(new BigNumber('1.02941176470588235294'));
    expect(leverage).to.be.bignumber.equal(35);
    expect(liquidationPrice).to.be.bignumber.equal(120);
    expect(margin).to.be.bignumber.equal(new BigNumber('0.029411764705882353084'));
  });
  it('price at 120 liquidation 40x short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromLeverageAndLiquidation(new BigNumber(40), new BigNumber(120), price, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(new BigNumber('5.02008032128514056225'));
    expect(leverage).to.be.bignumber.equal(40);
    expect(liquidationPrice).to.be.bignumber.equal(120);
    expect(margin).to.be.bignumber.equal(new BigNumber('12.5502008032128514056'));
  });
})

/** EXPOSURE AND LIQUIDATION */
describe('calcFromExposureAndLiquidation', () => {
  it('lilPrice 35 units at 0.5 liquidation long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndLiquidation(new BigNumber(35), new BigNumber(0.5), lilPrice, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(35);
    expect(leverage).to.be.bignumber.equal(new BigNumber('0.24501225061253062653'));
    expect(liquidationPrice).to.be.bignumber.equal(0.5);
    expect(margin).to.be.bignumber.equal(new BigNumber('142.85000000000000000077'));
  });
  it('40 units at 80 long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndLiquidation(new BigNumber(40), new BigNumber(80), price, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(new BigNumber('40'));
    expect(leverage).to.be.bignumber.equal(new BigNumber('4.04448938321536905966'));
    expect(liquidationPrice).to.be.bignumber.equal(80);
    expect(margin).to.be.bignumber.equal(new BigNumber('988.99999999999999999908'));
  });
  it('lilPrice 35 units at 1.5 liquidation short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndLiquidation(new BigNumber(35), new BigNumber(1.5), lilPrice, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(35);
    expect(leverage).to.be.bignumber.equal(new BigNumber('0.24381748519679554162'));
    expect(liquidationPrice).to.be.bignumber.equal(1.5);
    expect(margin).to.be.bignumber.equal(new BigNumber('143.55'));
  });
  it('40 units at 120 short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromExposureAndLiquidation(new BigNumber(40), new BigNumber(120), price, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(new BigNumber('40'));
    expect(leverage).to.be.bignumber.equal(new BigNumber('3.9177277179236043095'));
    expect(liquidationPrice).to.be.bignumber.equal(120);
    expect(margin).to.be.bignumber.equal(new BigNumber('1021'));
  });
})

/** MARGIN AND LEVERAGE */
describe('calcFromMarginAndLeverage', () => {
  it('10x with 300 deposit long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromMarginAndLeverage(new BigNumber(300), new BigNumber(10), lilPrice, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(3000);
    expect(leverage).to.be.bignumber.equal(10);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('0.96088435374149659864'));
    expect(margin).to.be.bignumber.equal(300);
  });
  it('3x with 10k deposit long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromMarginAndLeverage(new BigNumber(10000), new BigNumber(3), price, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(300);
    expect(leverage).to.be.bignumber.equal(3);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('68.45238095238095238095'));
    expect(margin).to.be.bignumber.equal(10000);
  });
  it('10x with 300 deposit short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromMarginAndLeverage(new BigNumber(300), new BigNumber(10), lilPrice, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(3000);
    expect(leverage).to.be.bignumber.equal(10);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('1.03758169934640522876'));
    expect(margin).to.be.bignumber.equal(300);
  });
  it('3x with 10k deposit short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromMarginAndLeverage(new BigNumber(10000), new BigNumber(3), price, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(300);
    expect(leverage).to.be.bignumber.equal(3);
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('130.31045751633986928105'));
    expect(margin).to.be.bignumber.equal(10000);
  });
})

/** MARGIN AND LIQUIDATION */
describe('calcFromMarginAndLiquidation', () => {
  it('400 deposit and 0.5 liquidation long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromMarginAndLiquidation(new BigNumber(400), new BigNumber(0.5), lilPrice, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(new BigNumber('539.21568627450980392157'));
    expect(leverage).to.be.bignumber.equal(new BigNumber('1.3480392156862745098'));
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('0.5'));
    expect(margin).to.be.bignumber.equal(400);
  });
  it('10k deposit 98 liquidation long', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromMarginAndLiquidation(new BigNumber(10000), new BigNumber(98), price, MAX_LEVERAGE, LONG)
    expect(exposure).to.be.bignumber.equal(new BigNumber('2493.68686868686868686869'));
    expect(leverage).to.be.bignumber.equal(new BigNumber('24.93686868686868686869'));
    expect(liquidationPrice).to.be.bignumber.equal(new BigNumber('98'));
    expect(margin).to.be.bignumber.equal(10000);
  });
  it('700 deposit 1.25 liquidation short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromMarginAndLiquidation(new BigNumber(700), new BigNumber(1.25), lilPrice, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(new BigNumber('2090.90909090909090909091'));
    expect(leverage).to.be.bignumber.equal(new BigNumber('2.98701298701298701299'));
    expect(liquidationPrice).to.be.bignumber.equal(1.25);
    expect(margin).to.be.bignumber.equal(700);
  });
  it('10k deposit 200 liquidation short', () => {
    const { 
		exposure, 
		leverage,
		liquidationPrice,
		margin 
	} = calcFromMarginAndLiquidation(new BigNumber(10000), new BigNumber(200), price, MAX_LEVERAGE, SHORT)
    expect(exposure).to.be.bignumber.equal(new BigNumber('94.95192307692307692308'));
    expect(leverage).to.be.bignumber.equal(new BigNumber('0.94951923076923076923'));
    expect(liquidationPrice).to.be.bignumber.equal(200);
    expect(margin).to.be.bignumber.equal(10000);
  });
})