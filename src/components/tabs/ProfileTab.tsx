import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Transaction } from "@/types/transaction";

const ProfileTab: React.FC = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch transactions where connected address is either initiator, sender, or receiver
  const fetchUserTransactions = async () => {
    setLoading(true);
    try {
      const query = `/api/transactions?userAddress=${address}`;
      const response = await fetch(query);
      if (!response.ok) throw new Error("Error fetching transactions");
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) fetchUserTransactions();
  }, [address]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Transactions</h2>

      {loading ? (
        <div>Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="mt-4 text-gray-500">No transactions found.</div>
      ) : (
        <div className="mt-4">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="bg-gray-100 p-4 rounded-md shadow-md mb-4"
            >
              <p className="text-black">
                <strong>Initiator:</strong> {transaction.initiator}{" "}
                {transaction.initiator === address ? "(You)" : ""}
              </p>
              <p className="text-black">
                <strong>Sender:</strong> {transaction.sender}{" "}
                {transaction.sender === address ? "(You)" : ""}
              </p>
              <p className="text-black">
                <strong>Receiver:</strong> {transaction.receiver}{" "}
                {transaction.receiver === address ? "(You)" : ""}
              </p>
              <p className="text-black">
                <strong>Amount:</strong> {transaction.amount}
              </p>
              <p className="text-black">
                <strong>Chain ID:</strong> {transaction.chainId}
              </p>
              <p className="text-black">
                <strong>Status:</strong>{" "}
                {transaction.executed ? "Executed" : "Not Executed"}
              </p>
              <p className="text-black">
                <strong>Nonce:</strong> {transaction.nonce}
              </p>
              <p className="text-black">
                <strong>Initiate Date:</strong>{" "}
                {new Date(transaction.initiateDate).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileTab;
