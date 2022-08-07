import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("Donation", function () {
  let deployer: SignerWithAddress;
  let org: SignerWithAddress;
  before(async () => {
    [deployer, org] = await ethers.getSigners();
  });
  it("Should create new donation", async function () {
    const USDC = await ethers.getContractFactory("USDC");
    const usdc = await USDC.deploy(
      BigNumber.from(10_000_000).mul(BigNumber.from(10).pow(18))
    );
    const DonationFactory = await ethers.getContractFactory("DonationFactory");
    const donationFactory = await DonationFactory.deploy(usdc.address);
    await usdc.approve(donationFactory.address, convertTo18Decimals(10_000));
    await donationFactory.createWhaleDonation(
      "Save The Whales",
      "Effort to halt commercial whaling",
      org.address,
      convertTo18Decimals(10_000),
      100,
      convertTo18Decimals(500),
      3600 * 24 * 30 // 30 days
    );
    const donation = await donationFactory.allDonations(0);
    console.log("donation: ", donation);
  });
});

function convertTo18Decimals(num: number) {
  return BigNumber.from(num).mul(BigNumber.from(10).pow(18));
}
