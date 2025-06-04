import React, { useEffect, useState } from "react";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import entityABIJson from "../entity.json";

const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";
const entityABI = entityABIJson as AbiItem[];

const AddComponentAddress = () => {
  const [account, setAccount] = useState("");
  const [componentAddress, setComponentAddress] = useState("");
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

  const handleAddComponent = async () => {
    if (!componentAddress) {
      setStatus("Please enter a component address.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(entityABI, CONTRACT_ADDRESS);

      await contract.methods
        .addComponentAddress(componentAddress)
        .send({ from: account });

      setStatus("Component address added successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Error adding component address.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Component Address</h1>
      <div className="mb-4">
        <label className="block mb-1">Component Address (e.g., "Factory A"):</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={componentAddress}
          onChange={(e) => setComponentAddress(e.target.value)}
        />
      </div>
      <button
        onClick={handleAddComponent}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Add Component
      </button>
      {status && <p className="mt-4 text-sm text-blue-600">{status}</p>}
    </div>
  );
};

export default AddComponentAddress;
