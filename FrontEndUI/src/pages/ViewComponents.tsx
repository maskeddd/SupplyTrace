import React, { useEffect, useState } from "react";
import Web3 from "web3";
import provenanceABI from "../provenance.json";

const CONTRACT_ADDRESS = "0x7A24f036A33de382c311c1448C73a8310371Cf6E";


const ViewComponents = () => {
  const [components, setComponents] = useState<any[]>([]);
  const [account, setAccount] = useState<string>("");

  useEffect(() => {
    const fetchComponents = async () => {
      if ((window as any).ethereum) {
        const web3 = new Web3((window as any).ethereum);
        await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const contract = new web3.eth.Contract(provenanceABI as any, CONTRACT_ADDRESS);

        try {
          const result = await contract.methods.getComponentsByOwner(accounts[0]).call();
          console.log("Fetched components:", result);
          setComponents(result);
        } catch (error) {
          console.error("Error fetching components:", error);
        }
      }
    };

    fetchComponents();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Registered Components</h1>
      {components.length === 0 ? (
        <p>No components found for your address.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Component ID</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {components.map((component, idx) => (
              <tr key={idx}>
                <td className="border p-2">{component.componentId}</td>
                <td className="border p-2">{component.location}</td>
                <td className="border p-2">{new Date(Number(component.timestamp) * 1000).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewComponents;
