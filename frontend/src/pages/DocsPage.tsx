import React, { useState } from "react";
import { Terminal, Code2, Zap, Copy, CheckCircle } from "lucide-react";

function DocsPage() {
  const [selectedChain, setSelectedChain] = useState<"CORE">(
    "CORE"
  );

  const [copiedAddresses, setCopiedAddresses] = useState<{
    [key: string]: boolean;
  }>({});

  const poolAddresses: {
    [key in "CORE"]: { LSTBTC: string };
  } = {
    CORE:{
     LSTBTC:"0x3f52E4c6393c81ECE389adb3Eb614395f593C834"
    }
  };

  const handleCopyAddress = (token: string, address: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedAddresses((prev) => ({
        ...prev,
        [`${selectedChain}-${token}`]: true,
      }));

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedAddresses((prev) => ({
          ...prev,
          [`${selectedChain}-${token}`]: false,
        }));
      }, 2000);
    });
  };

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <a
            href="/"
            className="text-green-500 hover:text-green-400 transition-colors"
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
            {/* <Terminal className="w-8 h-8" /> */}
          </a>
          <h1 className="text-3xl font-bold">FlexiLoan Documentation</h1>
        </div>

        <pre className="text-3xl sm:text-5xl font-bold mb-8 text-purple-500">
          {`FlexiLoan`}
        </pre>

        <div className="space-y-12">
          {/* Overview Section */}
          <section className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Code2 className="w-6 h-6 mr-2" />
              Overview
            </h2>
            <p className="text-lg mb-4">
              FlexiLoan provides flash loans without requiring asset locking.
              Built on Reactive Network, it enables developers to access instant
              liquidity for arbitrage, collateral swaps, and self-liquidations.
            </p>
            <div className="flex items-center space-x-2 text-purple-500">
              <Zap className="w-5 h-5" />
              <span>
                No collateral required • Instant execution • Single transaction
              </span>
            </div>
          </section>

          {/* Key Concepts */}
          <section className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <h2 className="text-2xl font-bold mb-4">Key Concepts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-purple-500">
                  Flash Loans
                </h3>
                <p>
                  Uncollateralized loans that must be borrowed and repaid within
                  the same transaction. The entire execution happens atomically,
                  ensuring the loan is either fully repaid or the transaction
                  reverts.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-purple-500">
                  Liquidity Pools
                </h3>
                <p>
                  Smart contracts holding the available assets for flash loans.
                  FlexiLoan's unique approach doesn't require liquidity
                  providers to lock their assets.
                </p>
              </div>
            </div>
          </section>

          {/* Integration Guide */}
          <section className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <h2 className="text-2xl font-bold mb-4">Integration Guide</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-500">
                1. Interface Implementation
              </h3>
              <pre className="bg-black p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">
                  {`interface IFlexiLoanReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}`}
                </code>
              </pre>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-500">
                2. Contract Implementation
              </h3>
              <pre className="bg-black p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">
                  {`contract FlashLoanExample is IFlexiLoanReceiver {
    address public flexiLoan;

    constructor(address _flexiLoan) {
        flexiLoan = _flexiLoan;
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Your custom logic here
        
        // Approve repayment
        uint256 amountToRepay = amount + premium;
        IERC20(asset).approve(flexiLoan, amountToRepay);
        
        return true;
    }

    function executeFlashLoan(
        address asset,
        uint256 amount,
        bytes calldata params
    ) external {
        IFlexiLoan(flexiLoan).flashLoan(
            address(this),
            asset,
            amount,
            params
        );
    }
}`}
                </code>
              </pre>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-purple-500">
                3. Key Steps
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Implement the IFlexiLoanReceiver interface</li>
                <li>Add your custom logic in executeOperation</li>
                <li>
                  Ensure sufficient balance for repayment (amount + premium)
                </li>
                <li>Approve the FlexiLoan contract to pull the repayment</li>
              </ul>
            </div>
          </section>

          <section className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Liquidity Pools</h2>
              <select
                className="bg-black text-green-500 p-2 rounded border border-green-500"
                value={selectedChain}
                onChange={(e) =>
                  setSelectedChain(e.target.value as "CORE")
                }
              >
                <option value="BASE">CORE</option>
                
              </select>
            </div>

            <div className="space-y-4">
              {Object.entries(poolAddresses[selectedChain]).map(
                ([token, address]) => {
                  const copyKey = `${selectedChain}-${token}`;
                  const isCopied = copiedAddresses[copyKey];

                  return (
                    <div
                      key={token}
                      className="bg-black p-4 rounded-lg border border-green-500 flex items-center justify-between"
                    >
                      <div className="flex-grow mr-4">
                        <div className="text-purple-500 font-semibold mb-2">
                          {token} Pool Address
                        </div>
                        <div className="text-green-300 break-all">
                          {address}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyAddress(token, address)}
                        className="text-green-500 hover:text-green-400 transition-colors"
                        aria-label={`Copy ${token} pool address`}
                      >
                        {isCopied ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Copy className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* Best Practices */}
          <section className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-purple-500">Do's</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Test extensively on testnet</li>
                  <li>Implement proper error handling</li>
                  <li>Verify asset balances before operations</li>
                  <li>Use secure price feeds for calculations</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-purple-500">
                  Don'ts
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Skip security audits</li>
                  <li>Ignore gas costs in calculations</li>
                  <li>Store borrowed assets across transactions</li>
                  <li>Forget to approve token transfers</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security Considerations */}
          <section className="bg-gray-900 p-6 rounded-lg border border-green-500">
            <h2 className="text-2xl font-bold mb-4">Security Considerations</h2>
            <div className="space-y-4">
              <p>
                Flash loans are powerful but require careful implementation.
                Consider these security aspects:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Protect against reentrancy attacks</li>
                <li>Validate all external calls</li>
                <li>Use secure math operations</li>
                <li>Implement access controls</li>
                <li>Monitor for price manipulation</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DocsPage;
