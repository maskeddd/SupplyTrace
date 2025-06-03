import React, { useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";



declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = "0x7A24f036A33de382c311c1448C73a8310371Cf6E";


const RegisterComponent: React.FC = () => {
  const [componentId, setComponentId] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    if (!window.ethereum) {
      setMessage("Please install MetaMask.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();

      const contract = new web3.eth.Contract(
        provenanceABI as any,
        CONTRACT_ADDRESS
      );

      await contract.methods
        .registerComponent(componentId, location)
        .send({ from: accounts[0] });

      setMessage("✅ Component registered successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error: " + (err?.message || "Something went wrong."));
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register Component</h1>

      <input
        type="text"
        placeholder="Component ID"
        value={componentId}
        onChange={(e) => setComponentId(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      <button
        onClick={handleRegister}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Register
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default RegisterComponent;
