// ViewEntities.tsx
// React component to fetch and display all registered entities (producers/manufacturers) from the EntityContract

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import entityABIJson from "../entity.json";

// Address of the deployed EntityContract
const CONTRACT_ADDRESS = "0x7680edBD58bC398fae8fd03B6fcab0DfF42d3D6F";
const entityABI = entityABIJson as AbiItem[];

const ViewEntities = () => {
  // State for storing registered entities
  const [entities, setEntities] = useState<{ address: string; name: string; type: string }[]>([]);
  const [account, setAccount] = useState(""); // Currently connected Ethereum account

  /**
   * Loads registered entities from the blockchain on component mount
   */
  useEffect(() => {
    const loadEntities = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);

        // Request access to MetaMask wallet
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        // Load contract
        const contract = new web3.eth.Contract(entityABI, CONTRACT_ADDRESS);

        // Fetch all registered entity addresses
        const addresses = await contract.methods.getRegisteredEntities().call();

        // Map each address to detailed entity info
        const entityData = await Promise.all(
          addresses.map(async (addr: string) => {
            const entity = await contract.methods.entities(addr).call();
            return {
              address: addr,
              name: entity.name,
              type: entity.entityType,
            };
          })
        );

        setEntities(entityData);
      }
    };

    loadEntities();
  }, []);

  /**
   * Renders the table of registered entities
   */
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Registered Entities</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Address</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Type</th>
          </tr>
        </thead>
        <tbody>
          {entities.map((entity, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{entity.address}</td>
              <td className="py-2 px-4 border-b">{entity.name}</td>
              <td className="py-2 px-4 border-b">{entity.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewEntities;
