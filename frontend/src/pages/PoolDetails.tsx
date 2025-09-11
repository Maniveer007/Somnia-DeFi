import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Wallet, Clock, Plus, Minus, Info } from "lucide-react";
import { useSpecificPool } from "../hooks/usePool";
// import { ethers } from "ethers";
import { abi } from "../abi/flashloanAbi";
import { useAccount, usePublicClient, useReadContract, useReadContracts, useWriteContract } from "wagmi";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function PoolDetails() {
  const { chainId , poolname } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const { pool ,  upcommingLPs } = useSpecificPool(Number(chainId),poolname);
  const { data: hash ,error, writeContract, isPending } = useWriteContract();
  
  const {address} = useAccount();
  const MAX_UINT256 =
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";

  const [userPosition, setUserPosition] = useState({
    isLiquidityProvider: false,
    liquidity: "0",
    balance: "0",
    allowance: "0",
    tokenName: "",
  });
  console.log(error,isPending)
  const { data } = useReadContracts({
    contracts: [
      
      {
        address: pool?.contractAddress,
        abi: abi,
        functionName: 'userIndex',
        args: [address],
        chainId: pool?.chainId,
      },
      {
        address: pool?.contractAddress,
        abi: abi,
        functionName: '_getLiquidity',
        args: [address],
        chainId: pool?.chainId,
      },
      {
        address: pool?.tokenAddress,
        abi: [
          {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        ],
        functionName: 'balanceOf',
        args: [address||"0x00"],
        chainId: pool?.chainId,
      },
      {
        address: pool?.tokenAddress,
        abi: [
          {
            "constant": true,
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "name": "_spender",
                    "type": "address"
                }
            ],
            "name": "allowance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },        ],
        functionName: 'allowance',
        args: [address || "0x00", pool?.contractAddress || "0x00"],
        chainId: pool?.chainId,
      },
    ],
  });

  // console.log(data);
  console.log(pool?.tokenAddress);
  
  
              
  // const tokenAddress = data?.[0]?.result as `0x${string}`;
  const userLPIndex = data?.[0]?.result as BigInt;
  const liquidity = data?.[1]?.result as BigInt;
  
 
  
  const balance = data?.[2]?.result as BigInt;
  const allowance = data?.[3]?.result as BigInt;

  const handleProvideLiquidity = async ()=>{
    if(!pool) return ;
    writeContract({
      address: pool?.tokenAddress,
      abi:[{
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }],
      functionName: "approve",
      args: [pool.contractAddress, liquidityAmount!=MAX_UINT256 ? BigInt(Number(liquidityAmount) * 10** pool.decimals):BigInt(MAX_UINT256) ],
      chainId : pool?.chainId
    })

    await sleep(1000);

    writeContract({
      address: pool?.contractAddress,
      abi:abi,
      functionName: "updateUser",
      args: [address],
      chainId : pool?.chainId
    })


  }

  const handleRemoveLiquidity = async ()=>{
    if(!pool) return ;
    writeContract({
      address: pool?.tokenAddress,
      abi:[{
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }],
      functionName: "approve",
      args: [pool.contractAddress, BigInt(0) ],
      chainId : pool?.chainId
    })
  }

  useEffect(() => {
    if(hash) {
      // Transaction was successful
      setShowModal(false);
      // Could add a toast notification here
    }
  }, [hash]);

  useEffect(() => {
      setUserPosition({
        isLiquidityProvider: userLPIndex ? Number(userLPIndex) !=0 : false ,
        liquidity: Number(userLPIndex) !=0 ?liquidity?.toString():"0",
        balance: balance?.toString(),
        allowance: allowance?.toString(),
        tokenName: pool? pool.tokenName : "",
      });


  }, [liquidity, balance, allowance, pool]);

  const formattedBalance = (
    Number(userPosition.balance) /
    10 ** (pool?.decimals ?? 18)
  ).toFixed(2);
  const formattedLiquidity = (
    Number(userPosition.liquidity) /
    10 ** (pool?.decimals ?? 18)
  ).toFixed(2);
  const totalAvailableLiquidity = (
    Math.min(Number(userPosition.balance), Number(userPosition.allowance)) /
    10 ** (pool?.decimals ?? 18)
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="text-green-500 hover:text-green-400 transition-colors flex items-center gap-2"
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
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold">{pool?.PoolName}</h1>
        </div>

        <pre className="text-3xl sm:text-5xl font-bold mb-8 text-purple-500">
          {`FlexiLoan`}
        </pre>

        <div className="bg-gray-900 p-6 rounded-lg border border-green-500 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6" />
              <span className="text-xl">
                Current Epoch: {pool?.currentEpoch}
              </span>
            </div>
            <button
              // onClick={connectWallet}
              className="flex items-center space-x-2 bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 transition-all duration-300"
            >
              <Wallet className="w-5 h-5" />
              <span>
                {address
                  ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : "Connect Wallet"}
              </span>
            </button>
          </div>

          {!address ? (
            <div className="text-center py-8">
              <p className="text-xl mb-4">Connect your wallet to participate</p>
            </div>
          ) : !userPosition.isLiquidityProvider ? (
            <div className="text-center py-8">
              <p className="text-xl mb-4">
                You are not currently a Liquidity Provider
              </p>
              {/* <p className="text-gray-400 mb-6">
                Total Available Liquidity: {totalAvailableLiquidity}{" "}
                {userPosition.tokenName}
              </p> */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded mx-auto hover:bg-purple-400 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Provide Liquidity</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl mb-4">Active Liquidity Provider</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <p className="text-green-400">
                    Current Epoch Liquidity: {formattedLiquidity}{" "}
                    {userPosition.tokenName}
                  </p>
                </div>
                <p className="text-gray-400">
                  Total Available: {totalAvailableLiquidity}{" "}
                  {userPosition.tokenName}
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-400 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Update Liquidity</span>
                </button>
                <button
                  onClick={handleRemoveLiquidity}
                  className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded hover:bg-red-400 transition-all duration-300"
                >
                  <Minus className="w-5 h-5" />
                  <span>Remove Liquidity</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-green-500 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">Upcoming LP Queue</h2>
            <Info
              className="w-4 h-4 text-gray-400"
              // title="Liquidity providers waiting to join the next epoch"
            />
          </div>
          <div className="space-y-4">
            {upcommingLPs?.length > 0 ? (
              upcommingLPs?.map((lp, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-green-500/30 pb-2"
                >
                  <span className="font-mono text-sm">{lp.user}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                No upcoming liquidity providers
              </p>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-900 p-8 rounded-lg border border-green-500 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Provide Liquidity</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <label>Amount</label>
                  <span>
                    Balance: {formattedBalance} {userPosition.tokenName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={liquidityAmount}
                    onChange={(e) => setLiquidityAmount(e.target.value)}
                    className="flex-1 bg-black border border-green-500 rounded p-2 text-green-500"
                    placeholder={`Enter amount in ${userPosition.tokenName}`}
                  />
                  <button
                    onClick={() => setLiquidityAmount(MAX_UINT256)}
                    className="px-3 py-1 bg-green-500 text-black rounded hover:bg-green-400 transition-colors font-medium"
                  >
                    MAX
                  </button>
                </div>
                {/* <p className="text-sm text-gray-400 mt-2">
                  Available: {totalAvailableLiquidity} {userPosition.tokenName}
                </p> */}
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProvideLiquidity}
                  disabled={isPending}
                  className={`flex-1 px-4 py-2 ${isPending ? 'bg-gray-500' : 'bg-green-500'} text-black rounded hover:bg-green-400 transition-colors relative`}
                >
                  {isPending ? (
                    <>
                      <span className="opacity-0">Confirm</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                      </div>
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PoolDetails;
