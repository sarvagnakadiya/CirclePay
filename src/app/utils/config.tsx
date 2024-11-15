import { http, createConfig } from "@wagmi/core";
import {
  mainnet,
  arbitrum,
  optimism,
  polygon,
  arbitrumSepolia,
} from "@wagmi/core/chains";
import { type Chain } from "viem";
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
import {
  injected,
  coinbaseWallet,
  metaMask,
  mock,
  safe,
} from "@wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, arbitrum, optimism, polygon, arbitrumSepolia],
  // connectors: [injected(), coinbaseWallet(), metaMask(), safe()],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [arbitrumSepolia.id]: http(),

    // [local.id]: http("http://127.0.0.1:8545"),
  },
  // ssr: true,
});
