"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  PlayCircle,
  DollarSign,
  Users,
  PlusCircle,
  Plus,
  X,
  Clock,
  BarChart,
} from "lucide-react";
import { initializeClient } from "@/app/utils/publicClient";
import contractABI from "@/CirclePay.json";

import { getChainId } from "@wagmi/core";
import { config } from "@/app/utils/config";
import { Address, formatEther, pad, PublicClient } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { getContractAddress } from "@/app/utils/contractAddresses";

interface Campaign {
  id: string;
  thumbnail: string;
  reserve: number;
  delivered: number;
  status: "active" | "paused" | "completed";
  startDate: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "success" | "danger";
  children: React.ReactNode;
  className?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className}`}
    {...props}
  />
);

// Helper function to format dates consistently
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const AdCampaignDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "0xc92a16fa64c781fe8a292fedf42bd069dedadd5478263c43ba5d5e9a2d4ef41f",
      thumbnail: "",
      reserve: 9999999999900000,
      delivered: 3,
      status: "active",
      startDate: "2024-03-15",
    },
  ]);

  const [showAddReserve, setShowAddReserve] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(0);
  const clientRef = useRef<PublicClient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { address, isConnected } = useAccount();
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const { writeContractAsync } = useWriteContract();

  const handleAddReserve = (campaignId: string, amount: string): void => {
    setCampaigns(
      campaigns.map((camp) =>
        camp.id === campaignId
          ? { ...camp, reserve: camp.reserve + Number(amount) }
          : camp
      )
    );
    setShowAddReserve(null);
  };

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "paused":
        return "bg-amber-100 text-amber-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    const setupClient = async () => {
      try {
        const currentChainId = getChainId(config);
        console.log(currentChainId);
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
        const response = await fetch(
          `/api/transactions?userAddress=${address}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleCreateCampaign = async () => {
    if (!isConnected) {
      alert("Please connect your account to participate.");
      return;
    }
    try {
      if (!clientRef.current) {
        alert("Client not initialized. Please try again.");
        return;
      }
      setIsParticipating(true);
      const tx = await writeContractAsync({
        address: getContractAddress(chainId) as Address,
        account: address,
        abi: contractABI.abi,
        functionName: "registerCampaign",
        args: ["abctestid"],
      });

      const receipt = await clientRef.current.waitForTransactionReceipt({
        hash: tx,
      });

      if (receipt) {
        const bytesId =
          "0xc92a16fa64c781fe8a292fedf42bd069dedadd5478263c43ba5d5e9a2d4ef41f";
        await fetch("/api/create-campaign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bytesId,
            address,
            showAddReserve,
          }),
        });
        setIsParticipating(false);
      }
    } catch (error) {
      console.error("Error participating:", error);
    } finally {
      setIsParticipating(false);
    }
    console.log("hello from fn");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Campaigns List Section */}
      <div className="w-2/3 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
          <div className="flex gap-4">
            <Button variant="outline">
              <Clock size={18} />
              Last 30 days
            </Button>
            <Button variant="outline">
              <BarChart size={18} />
              Analytics
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Thumbnail */}
                  <div className="relative w-80 rounded-lg overflow-hidden group">
                    <img
                      src={campaign.thumbnail}
                      alt={`Campaign ${campaign.id}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <PlayCircle size={48} className="text-white" />
                    </div>
                  </div>

                  {/* Campaign Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Campaign {campaign.id}
                          </h3>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              campaign.status
                            )}`}
                          >
                            {campaign.status.charAt(0).toUpperCase() +
                              campaign.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Started on {formatDate(campaign.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-8">
                      <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-3">
                        {/* <span className="text-indigo-600 bg-indigo-100 p-2 rounded-lg">
                          <DollarSign size={20} />
                        </span> */}
                        <div>
                          <p className="text-sm font-medium text-indigo-900">
                            Funds Reserve
                          </p>
                          <p className="text-lg font-semibold text-indigo-700">
                            {formatEther(BigInt(campaign.reserve))} eth
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-emerald-50 rounded-lg p-3">
                        <span className="text-emerald-600 bg-emerald-100 p-2 rounded-lg">
                          <Users size={20} />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-emerald-900">
                            Delivered To
                          </p>
                          <p className="text-lg font-semibold text-emerald-700">
                            {campaign.delivered.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {showAddReserve === campaign.id ? (
                      <div className="flex gap-2 items-center mt-4">
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="w-auto"
                          id={`reserve-${campaign.id}`}
                        />
                        <Button
                          variant="success"
                          className="w-auto"
                          onClick={() => {
                            const input = document.getElementById(
                              `reserve-${campaign.id}`
                            ) as HTMLInputElement;
                            handleAddReserve(campaign.id, input.value);
                          }}
                        >
                          <Plus size={18} />
                          Add Funds
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddReserve(null)}
                        >
                          <X size={18} />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setShowAddReserve(campaign.id)}
                        className="mt-4"
                      >
                        <Plus size={18} />
                        Add Reserve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Campaign Form Section */}
      <div className="w-1/3 p-8 bg-white border-l">
        <div className="sticky top-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Create New Campaign
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Video
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <Input
                type="file"
                accept="video/*"
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <PlusCircle className="w-10 h-10 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload video
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    MP4, WebM or OGG (Max. 800MB)
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Reserve Amount
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter amount"
                className="flex-1"
              />
              {/* <Button>
                <Plus size={18} />
                Add Reserve
              </Button> */}
            </div>
          </div>
          <br></br>

          <Button
            onClick={() => handleCreateCampaign()}
            className="w-full justify-center"
          >
            Create Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdCampaignDashboard;
