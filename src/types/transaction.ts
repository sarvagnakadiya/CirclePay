export interface Transaction {
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
  