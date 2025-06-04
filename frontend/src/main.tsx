import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterEntity from "./pages/RegisterEntity";
import ViewEntities from "./pages/ViewEntities";
import RegisterComponent from "./pages/RegisterComponent";
import AddComponentAddress from "./pages/AddComponentAddress";
import RegisterProduct from "./pages/RegisterProduct";
import ViewProducts from "./pages/ViewProducts";
import RegisterFinishedProduct from "./pages/RegisterFinishedProduct";
import ViewFinishedProducts from "./pages/ViewFinishedProducts";
import TransferOwnership from "./pages/TransferOwnership";
import MarkStolenProduct from "./pages/MarkStolenProduct";
import CheckStolenStatus from "./pages/CheckStolenStatus";
import ListProduct from "./pages/ListProduct";
import ViewListings from "./pages/ViewListings";
import ViewOwnershipHistory from "./pages/ViewOwnershipHistory";
import ViewComponents from "./pages/ViewComponents";

import "./index.css";

import Web3 from "web3";
import entityABIJson from "./entity.json";
import type { AbiItem } from "web3-utils";

const ENTITY_CONTRACT_ADDRESS = "0x308E7A9348243EAFcF5Fb86F1686F94F09B113eF";
const entityABI = entityABIJson as AbiItem[];

export const checkIfEntityRegistered = async (account: string): Promise<boolean> => {
  const web3 = new Web3(window.ethereum);
  const contract = new web3.eth.Contract(entityABI, ENTITY_CONTRACT_ADDRESS);
  return await contract.methods.isEntityRegistered(account).call();
};


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/register-entity" element={<RegisterEntity />} />
        <Route path="/view-entities" element={<ViewEntities />} />
        <Route path="/register-product" element={<RegisterProduct />} />
        <Route path="/register-component" element={<RegisterComponent />} />
        <Route path="/add-component" element={<AddComponentAddress />} />
        <Route path="/list-product" element={<ListProduct />} />
        <Route path="/mark-stolen-product" element={<MarkStolenProduct />} />
        <Route path="/check-stolen-status" element={<CheckStolenStatus />} />
        <Route path="/view-listings" element={<ViewListings />} />
        <Route path="/view-products" element={<ViewProducts />} />
        <Route path="/register-finished-product" element={<RegisterFinishedProduct />} />
        <Route path="/view-finished-products" element={<ViewFinishedProducts />} />
        <Route path="/transfer-ownership" element={<TransferOwnership />} />
        <Route path="/view-ownership-history" element={<ViewOwnershipHistory />} />
        <Route path="/view-components" element={<ViewComponents />} /> {/* new route */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
