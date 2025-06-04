// CheckStolenStatus.tsx
// React component to check if a product is marked as stolen using the ProvenanceContract

import React, { useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";

// Deployed address of the ProvenanceContract
const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";

const CheckStolenStatus: React.FC = () => {
  // State for product ID input
  const [productId, setProductId] = useState("");

  // State for showing status result
  const [statusMessage, setStatusMessage] = useState("");

  /**
   * Handles interaction with the smart contract to check stolen status
   */
  const handleCheckStatus = async () => {
    if (!window.ethereum) {
      setStatusMessage("MetaMask not detected.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);

      // Request account access from MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Load the Provenance contract instance
      const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);

      // Call the contract function to check stolen status
      const isStolen: boolean = await contract.methods.isProductStolen(productId).call();

      // Display result
      if (isStolen) {
        setStatusMessage("🚨 This product IS marked as stolen.");
      } else {
        setStatusMessage("✅ This product is NOT marked as stolen.");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage("Error: " + (err?.message || "An unexpected error occurred."));
    }
  };

  /**
   * Renders the UI to input product ID and display stolen status
   */
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Check Stolen Status</h2>

      {/* Product ID input field */}
      <input
        type="text"
        placeholder="Enter Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      {/* Action button */}
      <button
        onClick={handleCheckStatus}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Check Status
      </button>

      {/* Status message */}
      {statusMessage && <p className="mt-4">{statusMessage}</p>}
    </div>
  );
};

export default CheckStolenStatus;
