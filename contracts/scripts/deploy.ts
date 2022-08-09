// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const USDC = await ethers.getContractFactory("USDC");
  const usdc = await USDC.deploy(BigNumber.from(10_000_000).mul(BigNumber.from(10).pow(18)));
  await usdc.deployed();
  console.log("usdc deployed to:", usdc.address);

  const DonationFactory = await ethers.getContractFactory("DonationFactory");
  const donationFactory = await DonationFactory.deploy(usdc.address);
  await donationFactory.deployed();
  console.log("donationFactory deployed to:", donationFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
