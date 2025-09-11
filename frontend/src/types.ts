export interface Pool {
    chainId: number;
    chainUrl: string;
    name: string;
    contractAddress: string;
    decimals: number;
    totalLPs: number;
    currentEpoch: number;
    totalLiquidity: string;
  }