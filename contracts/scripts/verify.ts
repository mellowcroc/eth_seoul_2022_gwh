/* usage: npx hardhat run ./scripts/verify.ts --network mumbai */

/* eslint-disable prettier/prettier */
import hre, { ethers } from "hardhat";

async function main() {
  // USDC
  try {
    await hre.run("verify:verify", {
      contract: "contracts/USDC.sol:USDC",
      address: "0xbdb1e43e83a89b0ecdb051b0ce45a87230a0714c",
      constructorArguments: [
        ethers.BigNumber.from(100_000_000).mul(
          ethers.BigNumber.from(10).pow(18)
        ),
      ],
    });
  } catch (e) {
    console.log(e);
  }
  // DonationFactory
  try {
    await hre.run("verify:verify", {
      contract: "contracts/DonationFactory.sol:DonationFactory",
      address: "0x51faff9691809778008ecb5341e658ed7c900fa6",
      constructorArguments: [
        "0xbdb1e43e83a89b0ecdb051b0ce45a87230a0714c", // usdc
      ],
    });
  } catch (e) {
    console.log(e);
  }
}

main();
