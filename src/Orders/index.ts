import { ethers } from 'ethers';
import { OMEOrder } from '../Types/types';

/**
 * calculates the deterministic order id of an order
 *
 * @param order an OME serialised order
 * @returns a string representation of the order id
 */
export const calcOrderId = (order: OMEOrder): string => {
  const abiCoder = new ethers.utils.AbiCoder()

  return ethers.utils.keccak256(
    abiCoder.encode(
      ["address", "address", "uint256", "uint256", "uint256", "uint256", "uint256"],
      [order.user, order.target_tracer, order.price, order.amount, order.side === 'Bid' ? 0 : 1, order.expiration, order.created]
    )
  )
}