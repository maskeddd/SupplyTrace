// src/pages/ViewOwnershipHistory.tsx
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";

const CONTRACT_ADDRESS = "0x1B1D810a00742bd4C41df968B49541d86Afe2bFF";

const ViewOwnershipHistory = () => {
  const [productId, setProductId] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  const handleFetchHistory = async () => {
    if (!productId) {
      setStatus("Please enter a Product ID.");
      return;
    }

    if (!(window as any).ethereum) {
      setStatus("MetaMask not detected.");
      return;
    }

    try {
      const web3 = new Web3((window as any).ethereum);
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);

      const result = await contract.methods.getOwnershipHistory(productId).call();
      setHistory(result);
      setStatus("");
    } catch (error: any) {
      console.error(error);
      setStatus("Failed to fetch ownership history.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">View Ownership History</h2>
      <div className="mb-2">
        <label className="block mb-1">Product ID:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
      </div>
      <button
        onClick={handleFetchHistory}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Fetch History
      </button>
      {status && <p className="mt-4 text-sm text-red-500">{status}</p>}
      {history.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Ownership History:</h3>
          <ul className="list-disc pl-5">
            {history.map((entry, index) => (
              <li key={index} className="break-all">
                <span className="font-medium">From:</span> {entry.from}<br />
                <span className="font-medium">To:</span> {entry.to}<br />
                <span className="font-medium">Time:</span> {new Date(Number(entry.timestamp) * 1000).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ViewOwnershipHistory;
