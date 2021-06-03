import { expect } from 'chai';
import { generateDomainData, verifySignature } from "../src/Signing"

// todo would be good to test this using 
// our sign methods too...
let correctlySignedData = {
  order: {
    maker: '0xfb59B91646cd0890F3E5343384FEb746989B66C7',
    market: '0x100b427A173fA3e66759449B4Cf63818Bedb9F47',
    price: '1000000000000000000',
    amount: '1000000000000000000',
    side: 1,
    expires: 1918373212,
    created: 0
  },
  trader: "0xE7Cd937E73a750B9fe91100BD47b4c6EbBf50dD4",
  sig: "0x1fc3a9d92e2eb86967c077253dc2f5623be574c675c9d97f14c478c8a339028a4b01625c8f6c415d86f4044bfaaf8ada0d0310dc8c1fce1c097483ebc2f40d2b1c"
}


describe('generateDomainData', () => {
  it('should set the correct network', () => {
    const sampleData = generateDomainData("0xCaADD6982a36e3f5DDD271894EE2eDd4c10ef4Fd", 69)
    expect(sampleData.chainId).to.equal(69);
  });
});

describe('verifySignature', () => {
  it('returns true for correctly signed data', () => {
    const result = verifySignature(correctlySignedData.order, correctlySignedData.trader,
      correctlySignedData.sig, correctlySignedData.order.maker, 42)
    expect(result).to.equal(true)
  });

  it('returns false for incorrectly signed data', () => {
    const result = verifySignature(correctlySignedData.order, correctlySignedData.trader,
      correctlySignedData.sig, correctlySignedData.order.maker, 1337)
    expect(result).to.equal(false)
  })
});
