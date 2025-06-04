// MarkStolenProduct.tsx
// Allow registered entities to mark or unmark a product as stolen

import React, { useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";

// Replace with your deployed ProvenanceContract address
const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";

const MarkStolenProduct: React.FC = () => {
  // Local state for form input and status message
  const [productId, setProductId] = useState("");
  const [message, setMessage] = useState("");

  /**
   * Helper to initialize Web3, request account access, and return contract instance
   */
  const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);
    return { web3, accounts, contract };
  };

  /**
   * Sends transaction to mark a product as stolen
   */
  const handleMarkStolen = async () => {
    if (!window.ethereum) {
      setMessage("❌ MetaMask not detected.");
      return;
    }

    try {
      const { accounts, contract } = await getContract();
      await contract.methods.markAsStolen(productId).send({ from: accounts[0] });
      setMessage("Product successfully marked as stolen.");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err?.message || "An unexpected error occurred."));
    }
  };

  /**
   * Sends transaction to remove stolen status from a product
   */
  const handleRemoveStolenMark = async () => {
    if (!window.ethereum) {
      setMessage("MetaMask not detected.");
      return;
    }

    try {
      const { accounts, contract } = await getContract();
      await contract.methods.removeStolenMark(productId).send({ from: accounts[0] });
      setMessage("Stolen mark removed from product.");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err?.message || "An unexpected error occurred."));
    }
  };

  /**
   * Renders UI for product ID input and two buttons to mark/unmark the stolen status
   */
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Mark Product as Stolen</h2>

      {/* Input: Product ID */}
      <input
        type="text"
        placeholder="Enter Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      {/* Button: Mark as Stolen */}
      <button
        onClick={handleMarkStolen}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 mr-2"
      >
        Mark as Stolen
      </button>

      {/* Button: Remove Stolen Mark */}
      <button
        onClick={handleRemoveStolenMark}
        className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800 mt-2"
      >
        Remove Stolen Mark
      </button>

      {/* Status Message */}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default MarkStolenProduct;
