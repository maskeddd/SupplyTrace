import React, { useEffect, useState } from "react";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import entityABIJson from "../entity.json";

const CONTRACT_ADDRESS = "0x7680edBD58bC398fae8fd03B6fcab0DfF42d3D6F";
const entityABI = entityABIJson as AbiItem[];

const RegisterEntity = () => {
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("manufacturer");
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
    if (!name || !entityType) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(entityABI, CONTRACT_ADDRESS);

      await contract.methods
        .registerEntity(name, entityType)
        .send({ from: account });

      setStatus("Entity registered successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Error registering entity.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Register Entity</h1>
      <div className="mb-4">
        <label className="block mb-1">Entity Name:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Entity Type:</label>
        <select
          className="border p-2 w-full"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
        >
          <option value="manufacturer">Manufacturer</option>
          <option value="producer">Producer</option>
        </select>
      </div>
      <button
        onClick={handleRegister}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Register Entity
      </button>
      {status && <p className="mt-4 text-sm text-blue-600">{status}</p>}
    </div>
  );
};

export default RegisterEntity;
