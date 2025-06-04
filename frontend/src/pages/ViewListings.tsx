// src/pages/ViewListings.tsx
// View and buy active product listings from the MarketplaceContract
// Combine data from both MarketplaceContract and ProvenanceContract to show full listing details

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import marketplaceABIJson from '../marketplace.json';
import provenanceABIJson from '../provenance.json';

// Contract addresses (replace if redeployed)
const marketplaceAddress = '0xc7E0F0dD03567D8FEc420c8e4CdcD59750E56757';
const provenanceAddress = '0x27902aD519EaB8Ba14f57A0577c91F1A96015DdE';

// Listing structure to be displayed in the table
type Listing = {
  productId: string;
  name: string;
  seller: string;
  price: string;     // in wei
  ethPrice: string;  // in ETH
};

const ViewListings: React.FC = () => {
  // Web3 & smart contract instances
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [marketplace, setMarketplace] = useState<any>(null);
  const [provenance, setProvenance] = useState<any>(null);

  // User accounts from MetaMask
  const [accounts, setAccounts] = useState<string[]>([]);

  // Listings retrieved from Marketplace + Provenance
  const [listings, setListings] = useState<Listing[]>([]);

  /**
   * 🔌 Initialize web3, contracts, and user accounts
   */
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const _web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const _accounts = await _web3.eth.getAccounts();

        // Instantiate smart contracts
        const _marketplace = new _web3.eth.Contract(marketplaceABIJson as any, marketplaceAddress);
        const _provenance = new _web3.eth.Contract(provenanceABIJson as any, provenanceAddress);

        // Save to state
        setWeb3(_web3);
        setAccounts(_accounts);
        setMarketplace(_marketplace);
        setProvenance(_provenance);
      }
    };
    init();
  }, []);

  /**
   * Fetch all active listings and supplement them with product names from ProvenanceContract
   */
  useEffect(() => {
    const fetchListings = async () => {
      if (!marketplace || !provenance || !web3) return;

      try {
        const productIds: string[] = await marketplace.methods.getAllListedProductIds().call();
        const result: Listing[] = [];

        for (const id of productIds) {
          const listing = await marketplace.methods.getListing(id).call();

          if (listing[2]) {
            const seller = listing[0];
            let name = 'Unknown';

            // Attempt to match productId with registered product name
            const products = await provenance.methods.getProductsByOwner(seller).call();
            for (const product of products) {
              if (product.productId === id) {
                name = product.name;
                break;
              }
            }

            result.push({
              productId: id,
              name,
              seller,
              price: listing[1],
              ethPrice: web3.utils.fromWei(listing[1], 'ether'),
            });
          }
        }

        setListings(result);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      }
    };

    fetchListings();
  }, [marketplace, provenance, web3]);

  /**
   * Executes purchase transaction for a listed product
   */
  const handleBuy = async (productId: string, price: string) => {
    if (!marketplace || !web3 || accounts.length === 0) return;

    try {
      await marketplace.methods.buyProduct(productId).send({
        from: accounts[0],
        value: price,
      });
      alert('Purchase successful!');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. See console for details.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Active Listings</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Product ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Seller</th>
            <th className="border px-4 py-2">Price (ETH)</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing, i) => (
            <tr key={i}>
              <td className="border px-4 py-2">{listing.productId}</td>
              <td className="border px-4 py-2">{listing.name}</td>
              <td className="border px-4 py-2">{listing.seller}</td>
              <td className="border px-4 py-2">{listing.ethPrice}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => handleBuy(listing.productId, listing.price)}
                >
                  Buy with ETH
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewListings;
