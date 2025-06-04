// src/pages/Home.tsx
// Home page for the SupplyTrace dApp
// Show navigation buttons based on entity registration status

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import { checkIfEntityRegistered } from "../utils/checkEntity";

const Home = () => {
  // Current MetaMask address
  const [account, setAccount] = useState("");
  // Whether the address is a registered entity
  const [isRegistered, setIsRegistered] = useState(false);
  // Show loading state while checking
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  /**
   * Initialize on mount:
   * - Connect MetaMask
   * - Fetch account
   * - Check if account is a registered entity
   */
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];
        setAccount(currentAccount);

        const registered = await checkIfEntityRegistered(currentAccount);
        setIsRegistered(registered);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to SupplyTrace</h1>

      {/* Display connected wallet */}
      <p className="mb-6 text-gray-700">
        Viewing as: <span className="font-mono">{account}</span>
      </p>

      {/* Navigation buttons */}
      {!isLoading && (
        <div className="space-y-4">
          {/* Always accessible */}
          <button
            onClick={() => navigate("/register-entity")}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Register as Entity
          </button>

          {/* Registered entities only */}
          {isRegistered && (
            <>
              {/* Entity & Provenance Functionality */}
              <button onClick={() => navigate("/view-entities")} className="bg-green-600 text-white px-6 py-3 rounded">
                View Entities
              </button>
              <button onClick={() => navigate("/register-component")} className="bg-green-600 text-white px-6 py-3 rounded">
                Register Component
              </button>
              <button onClick={() => navigate("/view-components")} className="bg-green-600 text-white px-6 py-3 rounded">
                View Registered Components
              </button>
              <button onClick={() => navigate("/register-product")} className="bg-green-600 text-white px-6 py-3 rounded">
                Register Product
              </button>
              <button onClick={() => navigate("/view-products")} className="bg-green-600 text-white px-6 py-3 rounded">
                View Registered Products
              </button>
              <button onClick={() => navigate("/transfer-ownership")} className="bg-green-600 text-white px-6 py-3 rounded">
                Transfer Ownership
              </button>
              <button onClick={() => navigate("/view-ownership-history")} className="bg-green-600 text-white px-6 py-3 rounded">
                View Ownership History
              </button>

              {/* Theft Tracking */}
              <button onClick={() => navigate("/mark-stolen-product")} className="bg-red-600 text-white px-6 py-3 rounded">
                Mark Product as Stolen
              </button>
              <button onClick={() => navigate("/check-stolen-status")} className="bg-red-600 text-white px-6 py-3 rounded">
                Check Stolen Status
              </button>

              {/* Marketplace Access */}
              <button onClick={() => navigate("/list-product")} className="bg-green-600 text-white px-6 py-3 rounded">
                List Product On Marketplace
              </button>
              <button onClick={() => navigate("/view-listings")} className="bg-green-600 text-white px-6 py-3 rounded">
                View Listings On Marketplace
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
