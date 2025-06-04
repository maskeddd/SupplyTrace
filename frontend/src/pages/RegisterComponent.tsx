// RegisterComponent.tsx
// Register a supply chain component by a verified entity

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";
import entityABI from "../entity.json";
import { useNavigate } from "react-router-dom";

// Ensure Ethereum provider type safety
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Smart contract addresses (replace with latest deployments if needed)
const PROVENANCE_CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";
const ENTITY_CONTRACT_ADDRESS = "0x7680edBD58bC398fae8fd03B6fcab0DfF42d3D6F";

const RegisterComponent: React.FC = () => {
  // Component form state
  const [componentId, setComponentId] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /**
   * On mount, check if the connected MetaMask user is a registered entity
   * Redirects to home page if not registered
   */
  useEffect(() => {
    const checkRegistration = async () => {
      if (!window.ethereum) {
        setMessage("Please install MetaMask.");
        return;
      }

      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const entityContract = new web3.eth.Contract(
        entityABI as any,
        ENTITY_CONTRACT_ADDRESS
      );

      try {
        const isRegistered = await entityContract.methods
          .isEntityRegistered(account)
          .call();

        if (!isRegistered) {
          alert("Access denied: You must be a registered entity.");
          navigate("/");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking registration", error);
        setMessage("Error verifying entity registration.");
      }
    };

    checkRegistration();
  }, [navigate]);

  /**
   * Calls the ProvenanceContract to register a new component with provided ID and location
   */
  const handleRegister = async () => {
    if (!window.ethereum) {
      setMessage("Please install MetaMask.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();

      const contract = new web3.eth.Contract(
        provenanceABI as any,
        PROVENANCE_CONTRACT_ADDRESS
      );

      await contract.methods
        .registerComponent(componentId, location)
        .send({ from: accounts[0] });

      setMessage("Component registered successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err?.message || "Something went wrong."));
    }
  };

  // If verifying access, show loading text
  if (loading) {
    return <p className="p-8 text-center">Checking access...</p>;
  }

  // Render component registration form
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register Component</h1>

      {/* Input: Component ID */}
      <input
        type="text"
        placeholder="Component ID"
        value={componentId}
        onChange={(e) => setComponentId(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      {/* Input: Location */}
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      {/* Submit Button */}
      <button
        onClick={handleRegister}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Register
      </button>

      {/* Feedback Message */}
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default RegisterComponent;
