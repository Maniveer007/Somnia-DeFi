import React, { useState } from "react";
import { Terminal, Zap, ArrowRight, AlertTriangle } from "lucide-react";
import { ConnectButton } from '@rainbow-me/rainbowkit';

function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [isDocsHovered, setIsDocsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-6xl mx-auto relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 text-left">
            <pre
              className={`h-[80px] flex items-center text-4xl md:text-5xl font-extrabold transition-all duration-500 ${
                isHovered ? "text-purple-500 scale-105" : "text-green-500"
              }`}
              style={{ fontFamily: `Courier New, Courier, monospace` }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              FlexiLoan
            </pre>
          </div>
          <div className="flex items-center gap-8">
            <a
              href="/docs"
              className={`font-mono text-lg transition-all duration-300 ${
                isDocsHovered
                  ? "scale-110 text-purple-500 rotate-3 shadow-lg shadow-purple-500/20"
                  : "text-green-500"
              }`}
              onMouseEnter={() => setIsDocsHovered(true)}
              onMouseLeave={() => setIsDocsHovered(false)}
            >
              [docs]
            </a>
            <ConnectButton chainStatus="icon" />
          </div>
        </div>

        <div className="mt-12 space-y-8">


          <div className="bg-gray-900 p-6 rounded-lg border border-green-500 transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20">
            <h1 className="text-4xl font-bold mb-6">
              Revolutionary DeFi Protocol
            </h1>
            <p className="text-xl mb-8">
              No more asset locking. Earn passive rewards by simply holding
              assets in your wallet. Welcome to the future of decentralized
              finance.
            </p>
            <div className="flex items-center space-x-4">
              <Zap className="w-6 h-6 animate-pulse" />
              <p className="text-lg">
                Instant Rewards • No Lock Period • Maximum Flexibility
              </p>
            </div>
          </div>

          <a
            href="/pools"
            className="group flex items-center space-x-2 bg-green-500 text-black px-8 py-4 rounded-lg hover:bg-green-400 transition-all duration-300 w-fit"
          >
            <span>Explore Pools</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
          </a>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <h3 className="text-xl font-bold mb-4">No Lock-up Period</h3>
            <p>
              Your assets remain liquid and accessible at all times while
              earning rewards.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <h3 className="text-xl font-bold mb-4">Passive Rewards</h3>
            <p>
              Earn continuous rewards just by holding assets in your wallet.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <h3 className="text-xl font-bold mb-4">Flash Loans</h3>
            <p>
              Access instant liquidity through our revolutionary flash loan
              protocol.
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}

export default LandingPage;