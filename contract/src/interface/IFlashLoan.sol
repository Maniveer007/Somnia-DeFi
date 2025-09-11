// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.0;

interface IFlashLoan{

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
}