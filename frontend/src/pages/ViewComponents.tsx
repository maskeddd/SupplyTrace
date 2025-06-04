// src/pages/ViewComponents.tsx
// Display all components registered by the current MetaMask account

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";

// Deployed contract address (replace if redeployed)
const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";

const ViewComponents = () => {
  // List of components fetched from the smart contract
  const [components, setComponents] = useState<any[]>([]);
  // Current Ethereum address from MetaMask
  const [account, setAccount] = useState<string>("");

  /**
   * Fetches the components owned by the connected MetaMask account
   * Uses the getComponentsByOwner method from the ProvenanceContract
   */
  useEffect(() => {
    const fetchComponents = async () => {
      if ((window as any).ethereum) {
        const web3 = new Web3((window as any).ethereum);
        await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);

        try {
          const result = await contract.methods.getComponentsByOwner(accounts[0]).call();
          console.log("Fetched components:", result);
          setComponents(result);
        } catch (error) {
          console.error("Error fetching components:", error);
        }
      }
    };

    fetchComponents();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Registered Components</h1>

      {/* Display a message if no components are found */}
      {components.length === 0 ? (
        <p>No components found for your address.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Component ID</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {components.map((component, idx) => (
              <tr key={idx}>
                <td className="border p-2">{component.componentId}</td>
                <td className="border p-2">{component.location}</td>
                <td className="border p-2">
                  {new Date(Number(component.timestamp) * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewComponents;
