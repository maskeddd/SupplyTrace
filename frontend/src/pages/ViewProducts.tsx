// src/pages/ViewProducts.tsx
// Display all products registered

declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";

// Deployed ProvenanceContract address
const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";

const ViewProducts = () => {
  // Wallet address of current user
  const [account, setAccount] = useState("");

  // List of registered products owned by the user
  const [products, setProducts] = useState<any[]>([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  /**
   * Loads products on component mount
   * Connects to MetaMask, fetches current user's account and products from the ProvenanceContract
   */
  useEffect(() => {
    const fetchProducts = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);

        // Request wallet connection
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Get active account
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        console.log("Connected account:", accounts[0]);

        // Connect to ProvenanceContract
        const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);

        try {
          // Call contract to get products owned by user
          const result = await contract.methods.getProductsByOwner(accounts[0]).call();
          console.log("Raw product data:", result);
          setProducts(result);
        } catch (err) {
          console.error("Error fetching products:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Registered Products</h1>

      {/* Conditional rendering for loading or no data */}
      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found for your address.</p>
      ) : (
        // Display product table
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Product ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Components</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr key={idx}>
                <td className="border p-2">{product.productId}</td>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.componentIds.join(", ")}</td>
                <td className="border p-2">
                  {new Date(Number(product.timestamp) * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewProducts;
