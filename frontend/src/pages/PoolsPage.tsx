import React from "react";
import { Link } from "react-router-dom";
import { Coins, Users, Wallet } from "lucide-react";
import { useAllPools } from "../hooks/usePool";

function PoolsPage() {
  const { pools } = useAllPools();

  const formatLiquidity = (liquidity: string, decimals: number) => {
    const value = Number(liquidity) / 10 ** decimals;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-green-500 hover:text-green-400 transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="ml-2">Back</span>
        </Link>

        <div className="flex items-center mb-12">
          <h1 className="text-4xl font-extrabold text-left w-full">
            Available Pools
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pools.map((pool) => (
            <Link
              key={pool.contractAddress}
              to={`/pool/${pool.chainId}/${pool.PoolName}`}
              className="bg-gray-900 p-6 rounded-lg border border-green-500 hover:border-purple-500 transition-colors duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={pool.chainUrl}
                    alt={`${pool.PoolName} chain`}
                    className="w-6 h-6 rounded-full"
                  />
                  <h3 className="text-xl font-bold">{pool.PoolName}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>{pool.totalLPs}</span>
                  </div>
                </div>
                <span className="text-purple-500">
                  Epoch {pool.currentEpoch}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-400">
                  <Wallet className="w-4 h-4" />
                  <span>Total Liquidity</span>
                </div>
                <span className="text-green-400 font-medium">
                  {formatLiquidity(pool.totalLiquidity, pool.decimals)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PoolsPage;
