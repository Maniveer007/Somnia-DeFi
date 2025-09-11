export interface Pool {
  id: string;
  name: string;
  contractAddress: string;
  decimals: number;
  totalLPs: number;
  currentEpoch: number;
  totalLiquidity: string;
}

export interface UpcomingLP {
  user: string;
}

export interface UserPosition {
  isLiquidityProvider: boolean;
  isWaiting: boolean;
  queuePosition?: number;
  liquidity?: string;
}

export interface FlexiLoanState {
  isWalletConnected: boolean;
  currentPool?: Pool;
  userPosition: UserPosition;
  upcomingLPs: UpcomingLP[];
}

export type FlexiLoanAction =
  | { type: "CONNECT_WALLET" }
  | { type: "DISCONNECT_WALLET" }
  | { type: "SET_CURRENT_POOL"; payload: Pool }
  | { type: "PROVIDE_LIQUIDITY"; payload: { amount: string } }
  | { type: "SET_USER_POSITION"; payload: UserPosition }
  | { type: "SET_UPCOMING_LPS"; payload: UpcomingLP[] };
