"use client";
import { useState } from "react";
import SponsorTab from "@/components/tabs/SponsorTab";
import SearchTab from "@/components/tabs/SearchTab";
import NewPostTab from "@/components/tabs/NewPostTab";
import ReceivedTab from "@/components/tabs/ReceivedTab";
import ProfileTab from "@/components/tabs/ProfileTab";

const TabBar = () => {
  const [activeTab, setActiveTab] = useState(1);

  const renderContent = () => {
    switch (activeTab) {
      case 1:
        return <SponsorTab />;
      case 2:
        return <SearchTab />;
      case 3:
        return <NewPostTab />;
      case 4:
        return <ReceivedTab />;
      case 5:
        return <ProfileTab />;
      default:
        return <NewPostTab />;
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between">
      <div className="flex-grow p-4">{renderContent()}</div>
      <div className="flex justify-around bg-white p-2.5 border-t border-gray-200 bottom-0 fixed w-full">
        <button onClick={() => setActiveTab(1)} className="text-2xl">
          🏠
        </button>
        <button onClick={() => setActiveTab(2)} className="text-2xl">
          🔍
        </button>
        <button onClick={() => setActiveTab(3)} className="text-2xl">
          ➕
        </button>
        <button onClick={() => setActiveTab(4)} className="text-2xl">
          ❤️
        </button>
        <button onClick={() => setActiveTab(5)} className="text-2xl">
          👤
        </button>
      </div>
    </div>
  );
};

export default TabBar;
