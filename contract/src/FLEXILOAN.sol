// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.0;

/**
 * @title FlashLoan
 * @dev Implements a flash loan facility with a circular queue liquidity provider system
 * @notice Provides flash loans with a 0.05% fee split between LPs (0.04%) and protocol (0.01%)
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


interface IFlashLoanReceiver {
    function executeOperation(
        address token,
        uint256 amount,
        uint256 fee,
        address initiator,
        bytes calldata data
    ) external returns (bool);
}


contract FLEXILOAN is ReentrancyGuard{
    // State variables for managing flash loan operations
    IERC20 public token;                // The ERC20 token used for flash loans
    uint256 public currentEpochId;      // Current epoch for managing liquidity rounds

    // Fee configuration constants
    uint256 private constant PRECISION = 10000;    // Base precision for fee calculations
    uint256 private constant LP_FEE = 4;          // 0.04% fee for liquidity providers
    uint256 private constant PROTOCOL_FEE = 1;    // 0.01% fee for protocol
    address private immutable PROTOCOL_ADDRESS;    // Address receiving protocol fees

    /**
     * @dev Circular queue structure for managing liquidity providers
     * @notice Implements round-robin liquidity provision system
     */
    struct CircularQueue {
        LP[] queue;           // Array of liquidity providers
        uint256 current;      // Current position in the queue
    }

    struct LP {
        address user;
        uint256 activeEpochId;
        uint256 usedAmount;
    }

    struct withdrawLP{
        address user;
        uint256 withdrawAmount;
    }


    event UserUpdated (address indexed user,uint indexed balance,uint indexed approve);
    event RequestFlashLoan(address indexed receiver,uint indexed amount);

    CircularQueue public liquidityQueue;
    mapping(address => uint256) public userIndex;    // Maps user addresses to their queue position

    /**
     * @dev Contract constructor
     * @param _token Address of the ERC20 token used for flash loans
     * @param _protocol Address receiving protocol fees
     */
    constructor(
        address _token,
        address _protocol
    )  payable {
        token = IERC20(_token);
        PROTOCOL_ADDRESS = _protocol;
        // Initialize queue with dummy LP
        liquidityQueue.queue.push(
            LP(address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE), 0, 0)
        );
    }

    // receive() external payable {}
    
    /**
     * @dev Calculates available liquidity for a user
     * @param user Address of the liquidity provider
     */
    function _getLiquidity(address user) public view returns (uint256 liquidity) {
        uint256 balance = token.balanceOf(user);
        uint256 allowance = token.allowance(user, address(this));
        uint256 usedAmount = liquidityQueue.queue[userIndex[user]].activeEpochId == currentEpochId 
            ? liquidityQueue.queue[userIndex[user]].usedAmount 
            : 0;

        if(allowance == type(uint256).max){
            liquidity = balance >= usedAmount ? balance - usedAmount : 0;
        }
        else{
            //@info this line is because if allowance is not max allowance will be decreased by usedAmount so to handle that case
            if(balance > allowance + (usedAmount * PRECISION / (PRECISION + LP_FEE))){
                liquidity = allowance;
            }else{
                liquidity = balance - usedAmount;
            }
        }
        
    }

    /**
     * @dev Updates or adds a user's liquidity position
     * @param user Address of the liquidity provider
     * @notice Manages queue entry/exit and epoch transitions
     */
    function updateUser(address user) public {
        uint256 userIdx = userIndex[user];
        uint256 Liquidity = _getLiquidity(user);

        if (userIdx == 0 && Liquidity > 0) {
            // Add new liquidity provider
            LP memory newLP = LP(user, currentEpochId, 0);

            liquidityQueue.queue.push(newLP);
            userIndex[user] = liquidityQueue.queue.length - 1;
        } 
        else if (userIdx != 0) {
            // Update existing liquidity provider
            if (liquidityQueue.queue[userIdx].activeEpochId < currentEpochId) {
                liquidityQueue.queue[userIdx].usedAmount = 0;
                liquidityQueue.queue[userIdx].activeEpochId = currentEpochId;
            }

            if (token.allowance(user, address(this)) == 0 || token.balanceOf(user) == 0) {
                _removeUser(userIdx);
            }
        }
        emit UserUpdated(user, token.balanceOf(user), token.allowance(user, address(this)));
    }

    /**
    * @dev Removes a user from the liquidity queue and shifts remaining elements forward
    * @param index Position of the user to remove from the queue
    */
    function _removeUser(uint256 index) internal {
        require(liquidityQueue.queue.length > 0, "Queue is empty");
        require(index < liquidityQueue.queue.length, "Index out of bounds");
        
        address userToRemove = liquidityQueue.queue[index].user;
        
        // Shift all elements after index one position forward
        for (uint256 i = index; i < liquidityQueue.queue.length - 1; i++) {
            liquidityQueue.queue[i] = liquidityQueue.queue[i + 1];
            // Update the index mapping for the shifted user
            userIndex[liquidityQueue.queue[i].user] = i;
        }
        
        // Adjust current pointer if necessary
        if (liquidityQueue.current >= index) {
            liquidityQueue.current -= 1;
        }
        
        // Remove the user from the index mapping and pop the last element
        delete userIndex[userToRemove];
        liquidityQueue.queue.pop();
    }

    /**
     * @dev Executes a flash loan request
     * @param receiver Address receiving the flash loan
     * @param amount Amount of tokens to borrow
     * @param data Additional data for the flash loan callback
     * @notice Manages liquidity provision, fee collection, and loan execution
     */
    function requestFlashLoan(address receiver, uint256 amount, bytes calldata data) public nonReentrant{
        uint256 pendingAmount = amount;
        uint256 length = liquidityQueue.queue.length;
        uint256 i = liquidityQueue.current;
        bool isPartialUse;

        withdrawLP[] memory withdrawlps = new withdrawLP[](length);
        uint256 withdrawlpsIndex = 0;

        // Collect required liquidity from providers
        while (pendingAmount > 0) {
            LP memory currentLP = liquidityQueue.queue[i];

                uint256 liquidity = _getLiquidity(currentLP.user);
                if (liquidity > 0) {
                    isPartialUse = pendingAmount < liquidity;
                    uint256 toWithdraw = isPartialUse ? pendingAmount : liquidity;
                    token.transferFrom(currentLP.user, address(this), toWithdraw);
                    //@info to avoid the fees earned on this to participare in next iteration
                    //@info mainly comes into play when the users LP is partially used 
                    liquidityQueue.queue[i].usedAmount +=  
                         (toWithdraw * (PRECISION + LP_FEE)) / PRECISION ;
                       
                    pendingAmount -= toWithdraw;
                    withdrawlps[withdrawlpsIndex] = withdrawLP(
                        liquidityQueue.queue[i].user,
                        toWithdraw
                    );
                    withdrawlpsIndex++;
                }
            i = (i + 1) % length;

            // Increment epoch if full circle completed
            //@info in here we handle case when the inital LP is not in 0th index in the queue
            if (i == 0 && liquidityQueue.current !=0 && !isPartialUse) {
                currentEpochId++;
            }
        }

        //@info in here we handle case when the inital LP is in 0th index in the queue
        //@info this can be out of loop because we will not use a single LP double time
        //@info so if the first LP is in 0th index in the queue and in return if we come back to 0th index
        //@info it indicates that we completed a full circle
        if (i == 0  && liquidityQueue.current == 0 && !isPartialUse) {
            currentEpochId++;
        }

        // Update queue position
        if (isPartialUse) {
            //@info if the LP is partially used we will start from the last LP in the next iteration
            //@info the reason we need to move back is in 182 line we increment the i after the iterating over every LP
            liquidityQueue.current = (i + length - 1) % length;
        } else {
            liquidityQueue.current = i;
        }

        // Execute flash loan
        token.transfer(receiver, amount);
        uint256 FLASHLOAN_FEE = amount * (PROTOCOL_FEE + LP_FEE) / PRECISION;
        IFlashLoanReceiver(receiver).executeOperation(address(token), amount, FLASHLOAN_FEE, msg.sender, data);

        // Collect repayment and distribute fees
        token.transferFrom(receiver, address(this), amount + FLASHLOAN_FEE);
        token.transfer(PROTOCOL_ADDRESS, amount * PROTOCOL_FEE / PRECISION);

        // Return liquidity to providers with fees
        for (uint256 j = 0; j < withdrawlps.length; j++) {
            if (withdrawlps[j].user != address(0)) {
                token.transfer(
                    withdrawlps[j].user,
                    (withdrawlps[j].withdrawAmount * (PRECISION + LP_FEE)) / PRECISION
                );
                updateUser(withdrawlps[j].user);
            } else {
                //@info if withdrawlps[j].user is 0 that means the LP is not used
                //@info and we their are not further LPs used so we can break the loop
                break;
            }
        }
    }

    /**
     * @dev Returns ordered queue of liquidity providers for current epoch
     * @return Array of LP structures
     */
    function getCircularQueue() public view returns (LP[] memory) {
        uint256 length = liquidityQueue.queue.length;
        LP[] memory orderedQueue = new LP[](length);
        uint256 index = liquidityQueue.current;

        for (uint256 i = 0; i < length; i++) {
            orderedQueue[i] = liquidityQueue.queue[index];
            index = (index + 1) % length;
        }
        return orderedQueue;
    }

    /**
     * @dev Returns raw queue data
     * @return Array of LP structures
     */
    function getQueue() public view returns (LP[] memory) {
        return liquidityQueue.queue;
    }

    /**
    * @dev Calculates total liquidity as sum of min(balance,allowance) for each provider
    * @return Total liquidity amount
    */
    function getTotalLiquidity() public view returns (uint256) {
        uint256 totalLiquidity = 0;
        uint256 length = liquidityQueue.queue.length;

        // Skip the first element (dummy LP)
        for (uint256 i = 1; i < length; i++) {
            address provider = liquidityQueue.queue[i].user;
            if (provider != address(0)) {
                uint256 balance = token.balanceOf(provider);
                uint256 allowance = token.allowance(provider, address(this));
                totalLiquidity += balance > allowance ? allowance : balance;
            }
        }
        
        return totalLiquidity;
    }
}
