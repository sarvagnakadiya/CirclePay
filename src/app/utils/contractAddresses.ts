// contractAddresses.ts
export const CONTRACT_ADDRESSES: { [key: number]: string } = {
    421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // For chain ID 421614
    84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // For chain ID 84532
    1: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // For chain ID 1
  };
  
  export const getContractAddress = (chainId: number): string | undefined => {
    return CONTRACT_ADDRESSES[chainId];
  };
  