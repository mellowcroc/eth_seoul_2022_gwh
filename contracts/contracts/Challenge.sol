//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Challenge {
    // TODO : CUSTOM QUORUM
    uint256 public immutable quorum = 20;

    address public challenger;
    address public donation;
    string public desc;

    uint256 public votableUntil;
    
    mapping(address => bool) public voted;
    uint256 public maxVotes;
    uint256 public yesVotes;
    uint256 public noVotes;
    
    bool public isClosed;
    
    // TODO : CUSTOM START/END
    constructor(address challenger_, address donation_, string memory desc_) {
        challenger = challenger_;
        donation = donation_;
        desc = desc_;
        votableUntil = block.timestamp + 14 days;
    }

    function vote(bool yn) public {
        
    }

    function closeChallenge() public {
        
    }
}
