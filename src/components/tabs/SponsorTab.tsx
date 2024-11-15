import React, { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import contractABI from "@/usdc.json";
import { pad } from "viem";
import { initializeClient } from "@/app/utils/publicClient";

// Define a TypeScript interface for the transaction data
interface Transaction {
  _id: string;
  initiator: string;
  sender: string;
  receiver: string;
  amount: number | string;
  chainId: number;
  validAfter: number;
  validBefore: number;
  nonce: number;
  executed: boolean;
  sign: string;
  initiateDate: string;
}

const client = initializeClient();

const SponsorTab: React.FC = () => {
  const { writeContractAsync } = useWriteContract();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const { address, isConnected } = useAccount();

  // Fetch data from the API on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions?status=false");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle execution of a transaction
  const handleTransfer = async (
    from: string,
    to: string,
    value: string | number,
    nonce: number,
    sign: string,
    validAfter: number,
    validBefore: number,
    transactionId: string
  ) => {
    if (!isConnected) {
      alert("Please connect your account to participate.");
      return;
    }

    console.log("Initiating transfer...");
    const validateAddress = (address: string): `0x${string}` => {
      return address.startsWith("0x")
        ? (address as `0x${string}`)
        : (`0x${address}` as `0x${string}`);
    };

    try {
      setIsParticipating(true);
      const tx = await writeContractAsync({
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        account: address,
        abi: contractABI,
        functionName: "transferWithAuthorization",
        args: [
          from,
          to,
          value,
          validAfter,
          validBefore,
          pad(validateAddress(nonce.toString())),
          sign,
        ],
      });
      console.log(tx);

      const receipt = await client.waitForTransactionReceipt({ hash: tx });
      console.log(receipt);

      if (receipt) {
        // Call the execute API with the transaction ID and hash
        await fetch("/api/execute", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
            transactionHash: receipt.transactionHash,
          }),
        });

        setIsParticipating(false);
        // window.location.reload();
      }
    } catch (error) {
      console.log("Error participating:", error);
    } finally {
      setIsParticipating(false);
    }
  };

  const handleExecute = (transaction: Transaction) => {
    const from = transaction.sender;
    const to = transaction.receiver;
    const value = transaction.amount;
    const nonce = transaction.nonce;
    const sign = transaction.sign;
    const validAfter = transaction.validAfter;
    const validBefore = transaction.validBefore;

    handleTransfer(
      from,
      to,
      value,
      nonce,
      sign,
      validAfter,
      validBefore,
      transaction._id // Pass the transaction ID
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-black">
        Pending Transactions
      </h2>
      {transactions.length === 0 ? (
        <div className="text-black">No pending transactions found.</div>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-gray-100 p-4 rounded-md shadow-md mb-4"
          >
            <p className="text-black">
              <strong>Initiator:</strong> {transaction.initiator}
            </p>
            <p className="text-black">
              <strong>Sender:</strong> {transaction.sender}
            </p>
            <p className="text-black">
              <strong>Receiver:</strong> {transaction.receiver}
            </p>
            <p className="text-black">
              <strong>Amount:</strong> {transaction.amount}
            </p>
            <p className="text-black">
              <strong>Chain ID:</strong> {transaction.chainId}
            </p>
            <p className="text-black">
              <strong>Executed:</strong> {transaction.executed ? "Yes" : "No"}
            </p>
            <p className="text-black">
              <strong>Nonce:</strong> {transaction.nonce}
            </p>
            <p className="text-black">
              <strong>Initiate Date:</strong>{" "}
              {new Date(transaction.initiateDate).toLocaleString()}
            </p>
            <button
              onClick={() => handleExecute(transaction)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
              disabled={isParticipating}
            >
              {isParticipating ? "Processing..." : "Execute"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default SponsorTab;
