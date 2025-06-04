import React, { useState } from "react";
import Web3 from "web3";
import marketplaceABI from "../marketplace.json";

const CONTRACT_ADDRESS = "0xc7E0F0dD03567D8FEc420c8e4CdcD59750E56757";

const ListProduct: React.FC = () => {
  const [productId, setProductId] = useState("");
  const [priceEth, setPriceEth] = useState("");
  const [message, setMessage] = useState("");

  const handleList = async () => {
    if (!window.ethereum) {
      setMessage("Please install MetaMask.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const contract = new web3.eth.Contract(marketplaceABI as any, CONTRACT_ADDRESS);

      const priceWei = web3.utils.toWei(priceEth, "ether");

      await contract.methods
        .listProduct(productId, priceWei)
        .send({ from: account });

      setMessage("Product listed successfully!");
    } catch (error: any) {
      console.error(error);
      setMessage("❌ Error: " + (error?.message || "Something went wrong."));
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">List Product</h1>

      <input
        type="text"
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      <input
        type="text"
        placeholder="Price in ETH"
        value={priceEth}
        onChange={(e) => setPriceEth(e.target.value)}
        className="border px-4 py-2 w-full mb-4"
      />

      <button
        onClick={handleList}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        List Product
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};

export default ListProduct;
