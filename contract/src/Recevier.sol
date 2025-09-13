// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;

import "./interface/IFlashLoanReceiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Receiver is IFlashLoanReceiver{

    IERC20 public token;

    constructor(address _token) {
        token = IERC20(_token);
    }

        /**
     * @notice Handles the logic of the flash loan.
     * @param tokenAddress The address of the token borrowed in the flash loan.
     * @param amount The amount of tokens borrowed.
     * @param fee The fee charged for the flash loan.
     * @param initiator The address that initiated the flash loan.
     * @param data Arbitrary data passed from the flash loan provider.
     * @return success A boolean indicating the operation was successful.
     */
    function executeOperation(
        address tokenAddress,
        uint256 amount,
        uint256 fee,
        address initiator,
        bytes calldata data
    ) external override returns (bool) {
        // Ensure the borrowed token matches the expected token
        require(tokenAddress == address(token), "Invalid token borrowed");


        uint256 totalRepayment = amount + fee;
        token.approve(msg.sender, totalRepayment);

        // You can use the `data` parameter for additional logic or validation

        return true;
    }
}
