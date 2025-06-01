// NavBar.tsx
import type React from "react";
import { Link } from "react-router";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function truncateAddress(address: string): string {
  const hex = address.slice(2);
  const start = hex.slice(0, 4);
  const end = hex.slice(-4);
  return `0x${start}...${end}`;
}

interface NavLink {
  href: string;
  label: string;
}

const links: NavLink[] = [
  { label: "Register", href: "/" },
  { label: "Transfer", href: "/transfer" },
  { label: "My Items", href: "/items" },
  { label: "Lookup", href: "/lookup" },
];

const NavBar: React.FC = () => {
  const account = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const brand = "SupplyTrace";

  return (
    <nav className="bg-gray-800 text-gray-100 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold">{brand}</div>
          <ul className="flex space-x-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link className="text-gray-300 hover:text-gray-100 transition-colors" to={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-4">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              type="button"
              onClick={() => {
                if (account.status === "connected") {
                  disconnect();
                } else {
                  connect({ connector });
                }
              }}
              className="
                bg-gray-800
                hover:bg-gray-700
                focus:bg-gray-700
                focus:outline-none
                text-gray-100
                rounded
                px-4
                py-2
                transition-colors
                hover:cursor-pointer
              "
            >
              {account.status === "connected" && account.address ? truncateAddress(account.address) : "Connect Wallet"}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
