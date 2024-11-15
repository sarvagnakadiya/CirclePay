"use client";
import React, { useState } from "react";
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
      id: "CAM001",
      thumbnail: "/api/placeholder/320/180",
      reserve: 5000,
      delivered: 12500,
      status: "active",
      startDate: "2024-03-15",
    },
    {
      id: "CAM002",
      thumbnail: "/api/placeholder/320/180",
      reserve: 3200,
      delivered: 8900,
      status: "active",
      startDate: "2024-03-10",
    },
  ]);

  const [showAddReserve, setShowAddReserve] = useState<string | null>(null);

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
                        <span className="text-indigo-600 bg-indigo-100 p-2 rounded-lg">
                          <DollarSign size={20} />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-indigo-900">
                            Funds Reserve
                          </p>
                          <p className="text-lg font-semibold text-indigo-700">
                            ${campaign.reserve.toLocaleString()}
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
          <form className="space-y-6">
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
                <Button>
                  <Plus size={18} />
                  Add Reserve
                </Button>
              </div>
            </div>

            <Button className="w-full justify-center">Create Campaign</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdCampaignDashboard;
