import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import hre, { ethers } from "hardhat";
import {
  Donation,
  USDC,
  Donation__factory,
  Challenge__factory,
} from "../typechain";

describe("Donation", function () {
  let whale: SignerWithAddress;
  let org: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let challenger: SignerWithAddress;
  let usdc: USDC;
  let donationAddress: string;
  let donation: Donation;
  before(async () => {
    [whale, org, user1, user2, challenger] = await ethers.getSigners();
  });
  it("Should create new donation", async function () {
    const USDC = await ethers.getContractFactory("USDC");
    usdc = await USDC.deploy(
      BigNumber.from(13_550).mul(BigNumber.from(10).pow(18))
    );
    await usdc
      .connect(whale)
      .transfer(challenger.address, convertTo18Decimals(50));

    const DonationFactory = await ethers.getContractFactory("DonationFactory");
    const donationFactory = await DonationFactory.deploy(usdc.address);
    await usdc.approve(donationFactory.address, convertTo18Decimals(10_500));
    await donationFactory.createWhaleDonation(
      "Save The Whales",
      "Effort to halt commercial whaling",
      org.address,
      convertTo18Decimals(10_000),
      50,
      convertTo18Decimals(500), // bounty
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
    await donation.connect(whale).refund();
    expect(await usdc.balanceOf(whale.address)).to.equal(
      convertTo18Decimals(8_500)
    );
  });
  it("org can claim donation", async function () {
    const balancesPerEpoch = [
      0, 450, 900, 1350, 1800, 2250, 2700, 3150, 3600, 4050,
    ];
    for (let i = 0; i < 9; i++) {
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
  it("challenger can open challenges", async function () {
    await usdc
      .connect(challenger)
      .approve(await donation.getDAOAddress(), convertTo18Decimals(50));
    await donation
      .connect(challenger)
      .openChallenge("Here comes a new challenge");

    await expect(
      donation.openChallenge("Duplicated challenge")
    ).to.be.revertedWith("Ongoing or Approved challenge exists");
  });

  it("emission should stop when challenge accepted", async function () {
    const challengeAddr = await donation.getRecentChallenge();
    const challenge = Challenge__factory.connect(challengeAddr, user1);
    await challenge.vote(true);

    await challenge.connect(user2).vote(true);

    await ethers.provider.send("evm_increaseTime", [3600 * 24 * 14 + 1000]); // 14+ days
    await ethers.provider.send("evm_mine", []);

    await challenge.closeChallenge();
    await donation.stop();
    expect(await donation.emissionStopped()).to.equal(true);
    expect(await donation.refundAmountAfterStopped()).to.equal(
      convertTo18Decimals(450)
    );

    await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]); // 30 days
    await ethers.provider.send("evm_mine", []);

    // org cannot withdraw
    expect(await usdc.balanceOf(org.address)).to.equal(
      convertTo18Decimals(4050)
    );
    await expect(donation.connect(org).withdraw()).to.be.revertedWith(
      "cannot withdraw if stopped"
    );
    expect(await usdc.balanceOf(org.address)).to.equal(
      convertTo18Decimals(4050)
    );
    expect(await usdc.balanceOf(donation.address)).to.equal(
      convertTo18Decimals(450 + 500 /* bounty */)
    );
  });

  it("users can get refund from stopped donation", async function () {
    expect(await usdc.balanceOf(whale.address)).to.equal(
      convertTo18Decimals(8_500)
    );
    expect(await usdc.balanceOf(user1.address)).to.equal(0);
    expect(await usdc.balanceOf(user2.address)).to.equal(0);
    expect(await usdc.balanceOf(donation.address)).to.equal(
      convertTo18Decimals(450 + 500 /* bounty */)
    );
    await donation.connect(whale).refund();
    await donation.connect(user1).refund();
    await donation.connect(user2).refund();
    expect(await usdc.balanceOf(whale.address)).to.equal(
      BigNumber.from(86503).mul(BigNumber.from(10).pow(17))
    );
    expect(await usdc.balanceOf(user1.address)).to.equal(
      BigNumber.from(999).mul(BigNumber.from(10).pow(17))
    );
    expect(await usdc.balanceOf(user2.address)).to.equal(
      BigNumber.from(1_998).mul(BigNumber.from(10).pow(17))
    );
    expect(await usdc.balanceOf(donation.address)).to.equal(
      convertTo18Decimals(500 /* bounty */)
    );
  });

  it("challenger can claim bounty", async function () {
    expect(await usdc.balanceOf(donation.address)).to.equal(
      convertTo18Decimals(500 /* bounty */)
    );
    await donation.connect(challenger).claimBounty();
    expect(await usdc.balanceOf(donation.address)).to.equal(0);
    expect(await usdc.balanceOf(challenger.address)).to.equal(
      convertTo18Decimals(500)
    );
    expect(donation.connect(challenger).claimBounty()).to.be.revertedWith(
      "already claimed"
    );
  });
});

function convertTo18Decimals(num: number) {
  return BigNumber.from(num).mul(BigNumber.from(10).pow(18));
}
