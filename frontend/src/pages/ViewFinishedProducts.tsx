// src/pages/ViewFinishedProducts.tsx
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import provenanceABIJson from "../provenance.json";

const provenanceABI = provenanceABIJson as AbiItem[];
const CONTRACT_ADDRESS = "0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE";

const ViewFinishedProducts = () => {
  const [account, setAccount] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadFinishedProducts = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const contract = new web3.eth.Contract(provenanceABI, CONTRACT_ADDRESS);
        const result = await contract.methods.getFinishedProductsByOwner(accounts[0]).call();
        setProducts(result);
      } else {
        alert("MetaMask not detected. Please install MetaMask to continue.");
      }
    };

    loadFinishedProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Finished Products</h1>
      {account && (
        <p className="text-sm text-gray-500 mb-4">
          Viewing as: <span className="font-mono">{account}</span>
        </p>
      )}
      {products.length === 0 ? (
        <p>No finished products found for your address.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Product ID</th>
              <th className="border p-2">Component IDs</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr key={idx}>
                <td className="border p-2">{product.productId}</td>
                <td className="border p-2">{product.componentIds?.join(", ")}</td>
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

export default ViewFinishedProducts;
