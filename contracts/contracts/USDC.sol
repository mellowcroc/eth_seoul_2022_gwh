//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDC is ERC20 {
    constructor(uint256 totalSupply) ERC20("USDC", "USDC") {
        _mint(msg.sender, totalSupply);
    }
}
