// RegisterProduct.tsx
// Register a finished product using previously registered components

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";

// ProvenanceContract address (update this if redeployed)
const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";

// TypeScript: Extend window object to safely access `ethereum`
declare global {
  interface Window {
    ethereum?: any;
  }
}

const RegisterProduct = () => {
  // State variables for form inputs
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [componentIds, setComponentIds] = useState<string[]>([]);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [status, setStatus] = useState("");

  /**
   * Fetch all components owned by the user on initial render
   */
  useEffect(() => {
    const fetchComponents = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);

        try {
          const result = await contract.methods.getComponentsByOwner(accounts[0]).call();
          const ids = result.map((c: any) => c.componentId); // extract just the component IDs
          setComponentIds(ids);
        } catch (error) {
          console.error("Error fetching components:", error);
        }
      }
    };

    fetchComponents();
  }, []);

  /**
   * Register the product on the ProvenanceContract using selected component IDs
   */
  const handleRegister = async () => {
    if (!window.ethereum) {
      setStatus("MetaMask not detected");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);

      await contract.methods
        .registerProduct(productId, name, selectedComponentIds)
        .send({ from: accounts[0] });

      setStatus("Product registered successfully!");
    } catch (error) {
      console.error("Error registering product:", error);
      setStatus("Registration failed");
    }
  };

  /**
   * Update selected components when checkboxes are toggled
   * @param id - component ID
   */
  const handleCheckboxChange = (id: string) => {
    setSelectedComponentIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Register Product</h1>

      {/* Product ID Field */}
      <div className="mb-4">
        <label className="block mb-1">Product ID:</label>
        <input
          className="border p-2 w-full"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
      </div>

      {/* Product Name Field */}
      <div className="mb-4">
        <label className="block mb-1">Product Name:</label>
        <input
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Component Selection */}
      <div className="mb-4">
        <label className="block mb-1">Select Components:</label>
        {componentIds.length === 0 ? (
          <p>No components found for this account.</p>
        ) : (
          componentIds.map((id) => (
            <div key={id} className="mb-1">
              <label>
                <input
                  type="checkbox"
                  value={id}
                  checked={selectedComponentIds.includes(id)}
                  onChange={() => handleCheckboxChange(id)}
                  className="mr-2"
                />
                {id}
              </label>
            </div>
          ))
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Register Product
      </button>

      {/* Status Feedback */}
      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
};

export default RegisterProduct;
