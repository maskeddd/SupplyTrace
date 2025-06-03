// src/pages/ListProduct.tsx
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import marketplaceABIJson from "../marketplace.json";

const CONTRACT_ADDRESS = "0x0F73E2FFafeE47F9251ad91E13Be0FD1cE101e58";
const marketplaceABI = marketplaceABIJson as AbiItem[];

const ListProduct = () => {
  const [account, setAccount] = useState("");
  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } else {
        setStatus("MetaMask not detected");
      }
    };
    loadAccount();
  }, []);

  const handleListProduct = async () => {
    if (!productId || !price) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(marketplaceABI, CONTRACT_ADDRESS);
      const priceInWei = web3.utils.toWei(price, "ether");

      await contract.methods.listProduct(productId, priceInWei).send({ from: account });
      setStatus("Product listed successfully!");
    } catch (error) {
      console.error(error);
      setStatus("Failed to list product.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">List a Product for Sale</h1>
      <div className="mb-4">
        <label className="block mb-1">Product ID:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Price (in ETH):</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <button
        onClick={handleListProduct}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        List Product
      </button>
      {status && <p className="mt-4 text-blue-600">{status}</p>}
    </div>
  );
};

export default ListProduct;
