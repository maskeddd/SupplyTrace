// src/pages/TransferOwnership.tsx
// Trasnfer ownership of a product to a new address on SupplyTrace

import React, { useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";

// Contract deployed on Sepolia
const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";

const TransferOwnership = () => {
  // ID of the product to transfer
  const [productId, setProductId] = useState("");
  // Ethereum address of the new owner
  const [newOwner, setNewOwner] = useState("");
  // Status message to show feedback to the user
  const [status, setStatus] = useState("");

  /**
   * 🛠 Transfer the ownership of a product by calling the smart contract function
   */
  const handleTransfer = async () => {
    if (!(window as any).ethereum) {
      setStatus("MetaMask not detected.");
      return;
    }

    try {
      const web3 = new Web3((window as any).ethereum);
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);

      // Call transferOwnership from the current owner
      await contract.methods.transferOwnership(productId, newOwner).send({ from: accounts[0] });
      setStatus("Ownership transferred successfully!");
    } catch (error: any) {
      console.error(error);
      setStatus("Error during ownership transfer.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Transfer Product Ownership</h2>

      {/* Product ID input */}
      <div className="mb-2">
        <label className="block mb-1">Product ID:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
      </div>

      {/* New Owner address input */}
      <div className="mb-2">
        <label className="block mb-1">New Owner Address:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value)}
        />
      </div>

      {/* Transfer button */}
      <button
        onClick={handleTransfer}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Transfer Ownership
      </button>

      {/* Feedback message */}
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
};

export default TransferOwnership;
