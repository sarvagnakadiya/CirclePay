import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  arbitrum,
  optimism,
  polygon,
  arbitrumSepolia,
} from "@wagmi/core/chains";

import { type Chain } from "viem";

// Define local network as a custom chain
export const local = {
  id: 1,
  name: "Ethereum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
} as const satisfies Chain;

// Configure multiple networks
export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "8a002f09d4fc6fba7c4cd6d06df5e19f",
  chains: [
    mainnet,
    arbitrum,
    optimism,
    polygon,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [arbitrumSepolia] : [arbitrum]),
  ],
  ssr: true,
});
