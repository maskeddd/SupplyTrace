// ListProduct.tsx
// List a product on the MarketplaceContract with a specified price in ETH

import React, { useState } from "react";
import Web3 from "web3";
import marketplaceABI from "../marketplace.json";

// Replace with your deployed MarketplaceContract address
const CONTRACT_ADDRESS = "0xc7E0F0dD03567D8FEc420c8e4CdcD59750E56757";

const ListProduct: React.FC = () => {
  // Form input states
  const [productId, setProductId] = useState("");
  const [priceEth, setPriceEth] = useState(""); // ETH input
  const [message, setMessage] = useState("");   // Feedback for the user

  /**
   * Lists a product on the marketplace
   * Converts ETH price to Wei and sends transaction to smart contract
   */
  const handleList = async () => {
    if (!window.ethereum) {
      setMessage("Please install MetaMask.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);

      // Request user's MetaMask account
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      // Load contract instance
      const contract = new web3.eth.Contract(marketplaceABI as any, CONTRACT_ADDRESS);

      // Convert entered ETH price to Wei
      const priceWei = web3.utils.toWei(priceEth, "ether");

      // Send transaction to list the product
      await contract.methods
        .listProduct(productId, priceWei)
        .send({ from: account });

      setMessage("Product listed successfully!");
    } catch (error: any) {
      console.error(error);
      setMessage(" Error: " + (error?.message || "Something went wrong."));
    }
  };

  /**
   * Renders form UI for product ID and price, and a button to list the product
   */
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">List Product</h1>

      {/* Input: Product ID */}
      <input
        type="text"
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      {/* Input: Price in ETH */}
      <input
        type="text"
        placeholder="Price in ETH"
        value={priceEth}
        onChange={(e) => setPriceEth(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      {/* Button to trigger listing */}
      <button
        onClick={handleList}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        List Product
      </button>

      {/* Display feedback */}
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};

export default ListProduct;
