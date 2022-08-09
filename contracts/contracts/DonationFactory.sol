//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Donation.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DonationFactory {
    uint256 public CHALLENGE_COLLATRAL = 50e18;
    address public token;
    address[] public allDonations;

    constructor(address token_) {
        token = token_;
    }

    function reserveChallengeCollatral(address sender) public {
        IERC20(token).transferFrom(sender, address(this), CHALLENGE_COLLATRAL);
    }

    function createWhaleDonation(
        string calldata name_,
        string calldata description_,
        address org_,
        uint256 whaleDonationMax_,
        uint256 matchPercentage_,
        uint256 bounty_,
        uint256 duration_
    ) public returns (address donation) {
        bytes memory bytecode = type(Donation).creationCode;
        bytes32 salt = keccak256(
            abi.encodePacked(name_, org_, allDonations.length)
        );
        assembly {
            donation := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IERC20(token).approve(donation, whaleDonationMax_ + bounty_);
        IERC20(token).transferFrom(
            msg.sender,
            donation,
            whaleDonationMax_ + bounty_
        );
        Donation(donation).initialize(
            token,
            name_,
            description_,
            msg.sender,
            org_,
            whaleDonationMax_,
            matchPercentage_,
            bounty_,
            duration_
        );
        allDonations.push(donation);
    }
}
