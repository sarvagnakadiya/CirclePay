import React, { useEffect, useState, useRef } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { Address, pad, PublicClient } from "viem";
import { CheckCircle2, ArrowRight, Clock, Wallet, Loader2 } from "lucide-react";
import contractABI from "@/usdc.json";
import { initializeClient } from "@/app/utils/publicClient";
import { getChainId } from "@wagmi/core";
import { config } from "@/app/utils/config";
import { getContractAddress } from "@/app/utils/contractAddresses";
import { Transaction } from "@/types/transaction";

const SponsorTab: React.FC = () => {
  const { writeContractAsync } = useWriteContract();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [chainId, setChainId] = useState<number>(0);
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string>("");
  const { address, isConnected } = useAccount();
  const clientRef = useRef<PublicClient | null>(null);

  useEffect(() => {
    const setupClient = async () => {
      try {
        const currentChainId = getChainId(config);
        setChainId(currentChainId);
        const newClient = initializeClient(currentChainId);
        clientRef.current = newClient as PublicClient;
      } catch (error) {
        console.error("Error initializing client:", error);
      }
    };

    setupClient();
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

    setProcessingId(transactionId);
    const validateAddress = (address: string): `0x${string}` => {
      return address.startsWith("0x")
        ? (address as `0x${string}`)
        : (`0x${address}` as `0x${string}`);
    };

    try {
      if (!clientRef.current) {
        alert("Client not initialized. Please try again.");
        return;
      }
      setIsParticipating(true);
      const tx = await writeContractAsync({
        address: getContractAddress(chainId) as Address,
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

      const receipt = await clientRef.current.waitForTransactionReceipt({
        hash: tx,
      });

      if (receipt) {
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
      }
    } catch (error) {
      console.error("Error participating:", error);
    } finally {
      setIsParticipating(false);
      setProcessingId("");
    }
  };

  const handleExecute = (transaction: Transaction) => {
    handleTransfer(
      transaction.sender,
      transaction.receiver,
      transaction.amount,
      transaction.nonce,
      transaction.sign,
      transaction.validAfter,
      transaction.validBefore,
      transaction._id
    );
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string | number) => {
    return (Number(amount) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Transaction Sponsor Portal
            </h1>
            <p className="text-gray-600 mt-2">
              Execute pending transactions to earn rewards
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{transactions.length} Pending</span>
          </div>
        </div>

        {/* Connection Warning */}
        {!isConnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
            <Wallet className="w-5 h-5" />
            <p>
              Please connect your wallet to participate in transaction execution
            </p>
          </div>
        )}

        {/* Empty State */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Pending Transactions
            </h3>
            <p className="text-gray-500">
              Check back later for new opportunities to participate
            </p>
          </div>
        ) : (
          /* Transaction Grid */
          <div className="grid gap-6 md:grid-cols-2">
            {transactions
              .slice()
              .reverse()
              .map((transaction) => (
                <div
                  key={transaction._id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200
                    ${
                      processingId === transaction._id
                        ? "ring-2 ring-blue-500"
                        : "hover:shadow-md"
                    }`}
                >
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Chain ID: {transaction.chainId}
                      </span>
                      <time className="text-sm text-gray-500">
                        {new Date(
                          transaction.initiateDate
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          transaction.initiateDate
                        ).toLocaleTimeString()}
                      </time>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-full shadow-sm">
                            <Wallet className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">From</p>
                            <div className="flex items-center gap-2">
                              <code className="font-mono font-medium text-gray-900">
                                {formatAddress(transaction.sender)}
                              </code>
                              {transaction.sender === address && (
                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">To</p>
                          <div className="flex items-center gap-2">
                            <code className="font-mono font-medium text-gray-900">
                              {formatAddress(transaction.receiver)}
                            </code>
                            {transaction.receiver === address && (
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amount and Action */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatAmount(transaction.amount)}
                          </span>
                          <span className="text-gray-500">USDC</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleExecute(transaction)}
                        disabled={isParticipating}
                        className={`px-6 py-3 rounded-lg font-medium transition-all
                          ${
                            isParticipating && processingId === transaction._id
                              ? "bg-blue-100 text-blue-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                          }`}
                      >
                        {isParticipating && processingId === transaction._id ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing
                          </span>
                        ) : (
                          "Execute Transaction"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorTab;
