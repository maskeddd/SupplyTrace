import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
    return (
        <nav className="navbar">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/register-component" className="nav-link">
                Register Component
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/register-product" className="nav-link">
                Register Product
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/list-product" className="nav-link">
                List Product
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/view-products" className="nav-link">
                View Products
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/register-finished-product" className="nav-link">
                Register Finished Product
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/view-finished-products" className="nav-link">
                View Finished Products
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/transfer-ownership" className="nav-link">
                Transfer Ownership
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/view-ownership-history" className="nav-link">
                View Ownership History
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/view-components" className="nav-link">
                View Components
              </Link>
            </li>
          </ul>
        </nav>)
}