import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import hre, { ethers } from "hardhat";
import { Donation, USDC, Donation__factory } from "../typechain";

describe("Donation", function () {
  let whale: SignerWithAddress;
  let org: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let usdc: USDC;
  let donationAddress: string;
  let donation: Donation;
  before(async () => {
    [whale, org, user1, user2] = await ethers.getSigners();
  });
  it("Should create new donation", async function () {
    const USDC = await ethers.getContractFactory("USDC");
    usdc = await USDC.deploy(
      BigNumber.from(13_000).mul(BigNumber.from(10).pow(18))
    );
    const DonationFactory = await ethers.getContractFactory("DonationFactory");
    const donationFactory = await DonationFactory.deploy(usdc.address);
    await usdc.approve(donationFactory.address, convertTo18Decimals(10_000));
    await donationFactory.createWhaleDonation(
      "Save The Whales",
      "Effort to halt commercial whaling",
      org.address,
      convertTo18Decimals(10_000),
      50,
      convertTo18Decimals(500),
      3600 * 24 * 30 // 30 days
    );
    donationAddress = await donationFactory.allDonations(0);
    donation = Donation__factory.connect(donationAddress, whale);
  });
  it("users can donate", async function () {
    const user1DonationAmount = convertTo18Decimals(1_000);
    const user2DonationAmount = convertTo18Decimals(2_000);
    await usdc.connect(whale).transfer(user1.address, user1DonationAmount);
    await usdc.connect(whale).transfer(user2.address, user2DonationAmount);
    await usdc.connect(user1).approve(donationAddress, user1DonationAmount);
    await usdc.connect(user2).approve(donationAddress, user2DonationAmount);
    await donation.connect(user1).donate(user1DonationAmount);
    await donation.connect(user2).donate(user2DonationAmount);
  });
  it("donation duration is over", async function () {
    await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
    await ethers.provider.send("evm_mine", []);
    expect(
      donation.connect(user1).donate(convertTo18Decimals(1))
    ).to.revertedWith("donation stage has ended");
  });
  it("whale can refund unmatched donation", async function () {
    expect(await usdc.balanceOf(whale.address)).to.equal(0);
    donation.connect(whale).refund();
    expect(await usdc.balanceOf(whale.address)).to.equal(
      convertTo18Decimals(8_500)
    );
  });
  it("org can claim donation", async function () {
    const balancesPerEpoch = [
      0, 450, 900, 1350, 1800, 2250, 2700, 3150, 3600, 4050, 4500,
    ];
    for (let i = 0; i < 10; i++) {
      await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
      await ethers.provider.send("evm_mine", []);
      expect(await usdc.balanceOf(org.address)).to.equal(
        convertTo18Decimals(balancesPerEpoch[i])
      );
      await donation.connect(org).withdraw();
      expect(await usdc.balanceOf(org.address)).to.equal(
        convertTo18Decimals(balancesPerEpoch[i + 1])
      );
    }
  });
  // TODO: Add test for opening challenges and stopping donation emission
});

function convertTo18Decimals(num: number) {
  return BigNumber.from(num).mul(BigNumber.from(10).pow(18));
}
