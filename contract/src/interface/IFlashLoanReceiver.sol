// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;

interface IFlashLoanReceiver {
    function executeOperation(
        address token,
        uint256 amount,
        uint256 fee,
        address initiator,
        bytes calldata data
    ) external returns (bool);
}