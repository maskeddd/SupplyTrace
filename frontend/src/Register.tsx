// Register.tsx
import type React from "react";
import { useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import entityABI from "./abi/entity.json";

const address = "0x7B40f96170875ECd7E20aBE25406F1779275CccE";

function Register() {
  const account = useAccount();
  const [entityName, setEntityName] = useState<string>("");

  const { data: hash, writeContract } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isPending: isRegisterPending,
    error: registerError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!entityName.trim() || !account.address) {
      alert("Please enter an entity name and connect your wallet.");
      return;
    }
    writeContract({
      address: address,
      abi: entityABI,
      functionName: "registerEntity",
      args: [entityName.trim()],
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {account.status === "connected" && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Register as an Entity</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="entityName" className="block text-sm font-medium text-gray-700 mb-1">
                Entity Name (Business Name)
              </label>
              <input
                type="text"
                id="entityName"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="
                  mt-1
                  block
                  w-full
                  px-3
                  py-2
                  border
                  border-gray-300
                  rounded-md
                  shadow-sm
                  focus:outline-none
                  focus:ring-indigo-500
                  focus:border-indigo-500
                  sm:text-sm
                "
                placeholder="e.g., Acme Diamonds Inc."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isRegisterPending || isConfirming}
              className="
                w-full
                flex
                justify-center
                py-2
                px-4
                border
                border-transparent
                rounded-md
                shadow-sm
                text-sm
                font-medium
                text-white
                bg-indigo-600
                hover:bg-indigo-700
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:ring-indigo-500
                disabled:bg-gray-400
                disabled:cursor-not-allowed
              "
            >
              {isRegisterPending || isConfirming ? "Registering..." : "Register Entity"}
            </button>
          </form>

          {hash && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                Transaction Hash:{" "}
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`} // Adjust for your network
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  {hash}
                </a>
              </p>
            </div>
          )}

          {isConfirming && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">Waiting for transaction confirmation...</p>
            </div>
          )}

          {isConfirmed && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">Entity registered successfully!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Register;
