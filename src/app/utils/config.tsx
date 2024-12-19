import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  arbitrumSepolia,
  baseSepolia,
} from "@wagmi/core/chains";

export const config = getDefaultConfig({
  chains: [
    mainnet,
    base,
    arbitrum,
    optimism,
    polygon,
    arbitrumSepolia,
    baseSepolia,
  ],
  appName: "RainbowKit demo",
  projectId: "8a002f09d4fc6fba7c4cd6d06df5e19f",
  ssr: true,
});
