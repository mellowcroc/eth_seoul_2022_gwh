//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./DonationFactory.sol";

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

    bytes4 private constant TRANSFER_SELECTOR_1 =
        bytes4(keccak256(bytes("transfer(address,uint256)")));

    bytes4 private constant TRANSFER_SELECTOR_2 =
        bytes4(keccak256(bytes("transfer(address,address,uint256)")));

    address token;
    uint256 id;
    string name;
    string description;
    address org;
    address whale;
    bool whaleRefunded;
    uint256 whaleDonationMax; // min 5,000 USDC
    uint256 whaleDonationTotalAmount;
    uint256 bounty; // min 500 USDC
    uint256 matchPercentage; // min 10%
    uint256 withdrawnAmount;
    uint256 createdAt;
    uint256 expireAt;
    uint256 emissionDuration = 300 days;
    uint256 emissionRate = 30 days;
    bool emissionStopped;
    mapping(address => uint256) userDonations;
    mapping(address => bool) userRefunded;
    uint256 userDonationTotalAmount;
    address[] challenges;
    Report[] reports;
    bool refundMatch;

    address factory;

    constructor() public {
        factory = msg.sender;
    }

    function initialize(
        address token_,
        string calldata name_,
        string calldata description_,
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
        org = org_;
        whaleDonationMax = whaleDonationMax_;
        matchPercentage = matchPercentage_;
        bounty = bounty_;
        createdAt = block.timestamp;
        expireAt = createdAt + duration_;
    }

    function _safeTransfer(
        address token_,
        address to_,
        uint256 value_
    ) private {
        (bool success, bytes memory data) = token_.call(
            abi.encodeWithSelector(TRANSFER_SELECTOR_1, to_, value_)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "transfer failed"
        );
    }

    function _safeTransfer(
        address token_,
        address from_,
        address to_,
        uint256 value_
    ) private {
        (bool success, bytes memory data) = token_.call(
            abi.encodeWithSelector(TRANSFER_SELECTOR_2, from_, to_, value_)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "transfer failed"
        );
    }

    function donate(uint256 amount) public {
        require(block.timestamp < expireAt, "donation stage has ended");
        _safeTransfer(token, msg.sender, address(this), amount);
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
        uint256 maxWithdrawAmount = ((whaleDonationTotalAmount +
            userDonationTotalAmount) * epoch) /
            (emissionRate / emissionDuration);
        if (withdrawnAmount < maxWithdrawAmount) {
            withdrawnAmount = maxWithdrawAmount;
            _safeTransfer(
                token,
                msg.sender,
                maxWithdrawAmount - withdrawnAmount
            );
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
                _safeTransfer(
                    token,
                    whale,
                    calculateRefundAmount(whaleDonationTotalAmount)
                );
            } else if (
                userDonations[msg.sender] > 0 && !userRefunded[msg.sender]
            ) {
                userRefunded[msg.sender] = true;
                _safeTransfer(
                    token,
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
                _safeTransfer(
                    token,
                    msg.sender,
                    whaleDonationMax - whaleDonationTotalAmount
                );
                refundMatch = true;
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
