// src/utils/checkEntity.ts
// Verify if a connected wallet address is a registered entity

import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import entityABIJson from "../entity.json";

// Address of the deployed EntityContract
const ENTITY_CONTRACT_ADDRESS = "0x7680edBD58bC398fae8fd03B6fcab0DfF42d3D6F";
const entityABI = entityABIJson as AbiItem[];

/**
 * Check if the given Ethereum address is registered as an entity.
 *
 * @param account - The wallet address to verify
 * @returns A Promise resolving to true if registered, false otherwise
 */
export const checkIfEntityRegistered = async (account: string): Promise<boolean> => {
  try {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(entityABI, ENTITY_CONTRACT_ADDRESS);

    // Check registration status
    const isRegistered = await contract.methods.isEntityRegistered(account).call();
    return isRegistered;
  } catch (error) {
    console.error("Error checking entity registration:", error);
    return false;
  }
};
