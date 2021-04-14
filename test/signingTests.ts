import { expect } from 'chai';
import { generateDomainData } from "../src/Signing"

describe('generateDomainData', () => {
  it('should set the correct network', () => {
    const sampleData = generateDomainData("0xCaADD6982a36e3f5DDD271894EE2eDd4c10ef4Fd", 69)
    expect(sampleData.chainId).to.equal(69);
  });
});
