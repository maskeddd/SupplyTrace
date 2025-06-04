import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import { checkIfEntityRegistered } from "../utils/checkEntity";

export const useEntityAuth = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];
        const isRegistered = await checkIfEntityRegistered(currentAccount);

        if (!isRegistered) {
          alert("Access denied: You must be a registered entity.");
          navigate("/"); // Redirect to home
        } else {
          setLoading(false); // Allow page to render
        }
      }
    };

    checkAccess();
  }, [navigate]);

  return loading;
};
