import React, { useEffect, useState } from "react";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import provenanceABIJson from "../provenance.json";

const provenanceABI = provenanceABIJson as AbiItem[];
const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";

const RegisterFinishedProduct = () => {
  const [account, setAccount] = useState("");
  const [productId, setProductId] = useState("");
  const [componentIds, setComponentIds] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      }
    };
    loadAccount();
  }, []);

  const handleRegister = async () => {
    if (!productId || !componentIds) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(provenanceABI, CONTRACT_ADDRESS);
      const componentArray = componentIds.split(",").map(id => id.trim());

      await contract.methods
        .registerFinishedProduct(productId, componentArray)
        .send({ from: account });

      setStatus("Finished product registered successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Error registering finished product.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Register Finished Product</h1>
      <div className="mb-4">
        <label className="block mb-1">Product ID:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Component IDs (comma-separated):</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={componentIds}
          onChange={(e) => setComponentIds(e.target.value)}
        />
      </div>
      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Register Product
      </button>
      {status && <p className="mt-4 text-sm text-blue-600">{status}</p>}
    </div>
  );
};

export default RegisterFinishedProduct;
