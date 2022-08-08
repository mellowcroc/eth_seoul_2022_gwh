//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Donation.sol";

contract Challenge {
    enum ChallengeStatus {
        Ongoing,
        Disapproved,
        Approved
    }

    // TODO : CUSTOM QUORUM
    uint256 public immutable quorumPermil = 200;
    uint256 public immutable requiredApprovalRatioPermil = 600;
    uint256 public immutable duration = 14 days;

    address public donation;
    address public challenger;
    string public desc;

    uint256 public votableUntil;

    mapping(address => bool) public voted;
    uint256 public maxVoter;
    uint256 public yesVotes;
    uint256 public noVotes;

    ChallengeStatus public status;

    constructor() {
        donation = msg.sender;
    }

    // TODO : CUSTOM START/END
    function initialize(
        address challenger_,
        string memory desc_,
        uint256 maxVoter_
    ) public {
        challenger = challenger_;
        desc = desc_;
        votableUntil = block.timestamp + duration;
        status = ChallengeStatus.Ongoing;
        maxVoter = maxVoter_;
    }

    function getInfo()
        public
        view
        returns (
            address,
            address,
            string memory,
            uint256
        )
    {
        return (challenger, donation, desc, votableUntil);
    }

    function getVoteInfo()
        public
        view
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        return (yesVotes, noVotes, maxVoter);
    }

    function getChallenger() public view returns (address) {
        return challenger;
    }

    function getDonation() public view returns (address) {
        return donation;
    }

    function getDesc() public view returns (string memory) {
        return desc;
    }

    function getVotableUntil() public view returns (uint256) {
        return votableUntil;
    }

    function vote(bool yn) public {
        require(block.timestamp < votableUntil, "Vote perioed has ended.");
        require(
            Donation(donation).isDonatedAddr(msg.sender),
            "Only donated user can vote."
        );
        require(!voted[msg.sender], "Already voted.");
        voted[msg.sender] = true;
        if (yn) {
            yesVotes++;
        } else {
            noVotes++;
        }
    }

    function closeChallenge() public {
        require(block.timestamp > votableUntil, "Vote perioed has not ended.");
        require(status == ChallengeStatus.Ongoing, "This challenge has ended.");

        status = ChallengeStatus.Disapproved;
        uint256 votePermil = (yesVotes * 1000) / maxVoter;
        if (votePermil >= quorumPermil) {
            // to prevent div by zero
            uint256 yesPermil = (yesVotes * 1000) / (yesVotes + noVotes);
            if (yesPermil >= requiredApprovalRatioPermil) {
                status = ChallengeStatus.Approved;
            }
        }
    }

    function getChallengeStatus() public view returns (ChallengeStatus) {
        return status;
    }
}
