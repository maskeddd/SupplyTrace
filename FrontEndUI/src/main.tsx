import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterComponent from "./pages/RegisterComponent";
import RegisterProduct from "./pages/RegisterProduct";
import ViewProducts from "./pages/ViewProducts";
import RegisterFinishedProduct from "./pages/RegisterFinishedProduct";
import ViewFinishedProducts from "./pages/ViewFinishedProducts";
import TransferOwnership from "./pages/TransferOwnership";
import ListProduct from "./pages/ListProduct";
import ViewOwnershipHistory from "./pages/ViewOwnershipHistory";
import ViewComponents from "./pages/ViewComponents";

import "./index.css";
import NavBar from "./components/NavBar";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<RegisterComponent />} />
        <Route path="/register-product" element={<RegisterProduct />} />
        <Route path="/register-component" element={<RegisterComponent />} />
        <Route path="/list-product" element={<ListProduct />} />
        <Route path="/view-products" element={<ViewProducts />} />
        <Route path="/register-finished-product" element={<RegisterFinishedProduct />} />
        <Route path="/view-finished-products" element={<ViewFinishedProducts />} />
        <Route path="/transfer-ownership" element={<TransferOwnership />} />
        <Route path="/view-ownership-history" element={<ViewOwnershipHistory />} />
        <Route path="/view-components" element={<ViewComponents />} /> {/* ✅ NEW ROUTE */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
