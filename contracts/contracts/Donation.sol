//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./DonationFactory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Donation {
    struct Report {
        bytes32 ipfsHash;
        uint256 timestamp;
    }

    event Donated(
        address indexed token0,
        address indexed token1,
        address pair,
        uint256
    );

    address public token;
    uint256 public id;
    string public name;
    string public description;
    address public org;
    address public whale;
    bool public whaleRefunded;
    uint256 public whaleDonationMax; // min 5,000 USDC
    uint256 public whaleDonationTotalAmount;
    uint256 public bounty; // min 500 USDC
    uint256 public matchPercentage; // min 10%
    uint256 public withdrawnAmount;
    uint256 public createdAt;
    uint256 public expireAt;
    uint256 public emissionDuration = 300 days;
    uint256 public emissionRate = 30 days;
    bool public emissionStopped;
    mapping(address => uint256) public userDonations;
    mapping(address => bool) public userRefunded;
    uint256 public userDonationTotalAmount;
    address[] public challenges;
    Report[] public reports;
    bool public refundMatch;

    address factory;

    constructor() public {
        factory = msg.sender;
    }

    function initialize(
        address token_,
        string calldata name_,
        string calldata description_,
        address whale_,
        address org_,
        uint256 whaleDonationMax_,
        uint256 matchPercentage_,
        uint256 bounty_,
        uint256 duration_
    ) public {
        require(
            whaleDonationMax_ >= 5000e18,
            "match donation should be min 5,000 USDC"
        );
        require(matchPercentage_ >= 10, "match percentage should be min 10%");
        require(bounty_ >= 500e18, "bounty should be min 500 USDC");
        token = token_;
        name = name_;
        description = description_;
        whale = whale_;
        org = org_;
        whaleDonationMax = whaleDonationMax_;
        matchPercentage = matchPercentage_;
        bounty = bounty_;
        createdAt = block.timestamp;
        expireAt = createdAt + duration_;
    }

    function donate(uint256 amount) public {
        require(block.timestamp < expireAt, "donation stage has ended");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (whaleDonationMax - whaleDonationTotalAmount > 0) {
            uint256 matchAmount = min(
                (amount * matchPercentage) / 100,
                whaleDonationMax - whaleDonationTotalAmount
            );
            if (matchAmount > 0) {
                whaleDonationTotalAmount += matchAmount;
            }
        }
        userDonationTotalAmount += amount;
        userDonations[msg.sender] += amount;
    }

    function createReport(bytes32 ipfsHash) public {
        require(
            block.timestamp >= expireAt,
            "donation stage has not ended yet"
        );
        require(msg.sender == org, "only org can create report");
        reports.push(Report(ipfsHash, block.timestamp));
    }

    function withdraw() public {
        require(msg.sender == org, "only org can withdraw");
        require(!emissionStopped, "cannot withdraw if stopped");
        uint256 epoch = (block.timestamp - expireAt) / emissionRate; // epoch 0 ~ 10
        uint256 maxWithdrawableAmount = (((whaleDonationTotalAmount +
            userDonationTotalAmount) * epoch) * emissionRate) /
            emissionDuration;
        if (withdrawnAmount < maxWithdrawableAmount) {
            IERC20(token).transfer(
                msg.sender,
                maxWithdrawableAmount - withdrawnAmount
            );
            withdrawnAmount = maxWithdrawableAmount;
        }
    }

    function calculateRefundAmount(uint256 initialAmount)
        internal
        view
        returns (uint256)
    {
        uint256 ratio = initialAmount /
            (userDonationTotalAmount + whaleDonationTotalAmount);
        uint256 balance = IERC20(token).balanceOf(address(this));
        return balance * ratio;
    }

    function refund() public {
        if (emissionStopped) {
            if (msg.sender == whale && !whaleRefunded) {
                whaleRefunded = true;
                IERC20(token).transferFrom(
                    address(this),
                    msg.sender,
                    calculateRefundAmount(whaleDonationTotalAmount)
                );
            } else if (
                userDonations[msg.sender] > 0 && !userRefunded[msg.sender]
            ) {
                userRefunded[msg.sender] = true;
                IERC20(token).transfer(
                    msg.sender,
                    calculateRefundAmount(userDonations[msg.sender])
                );
            }
            return;
        }
        if (block.timestamp >= expireAt) {
            if (
                msg.sender == whale &&
                !refundMatch &&
                whaleDonationMax - whaleDonationTotalAmount > 0
            ) {
                refundMatch = true;
                IERC20(token).transfer(
                    msg.sender,
                    whaleDonationMax - whaleDonationTotalAmount
                );
            }
        }
    }

    function openChallenge() public {
        // TODO: require that there is no ongoing challenge
        // TODO: create challenge address and store it in challenges
        // bytes memory bytecode = type(Challenge).creationCode;
        // bytes32 salt = keccak256(abi.encodePacked(challenges.length));
        // address challenge;
        // assembly {
        //     challenge := create2(0, add(bytecode, 32), mload(bytecode), salt)
        // }
    }

    function stop() public {
        require(challenges.length > 0, "no challenges exist");
        require(
            msg.sender == challenges[challenges.length - 1],
            "can only be called by the challenge contract"
        );
        emissionStopped = true;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? b : a;
    }
}
