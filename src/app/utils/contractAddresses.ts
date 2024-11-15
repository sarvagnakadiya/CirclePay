// contractAddresses.ts
export const CONTRACT_ADDRESSES: { [key: number]: string } = {
    421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // For chain ID 421614
    1: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // For chain ID 1
  };
  
  export const getContractAddress = (chainId: number): string | undefined => {
    return CONTRACT_ADDRESSES[chainId];
  };
  