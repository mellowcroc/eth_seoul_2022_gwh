import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  Challenge,
  Challenge__factory,
  Donation,
  Donation__factory,
  USDC,
} from "../typechain";

enum ChallengeStatus {
  Ongoing,
  Disapproved,
  Approved,
}

describe("Challenger", function () {
  let challenger: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let addr4: SignerWithAddress;
  let whale: SignerWithAddress;
  let org: SignerWithAddress;
  let challenge: Challenge;
  let donation: Donation;
  let usdc: USDC;

  before(async () => {
    [challenger, addr1, addr2, addr3, addr4, whale, org] =
      await ethers.getSigners();

    const USDC = await ethers.getContractFactory("USDC");
    usdc = await USDC.deploy(
      ethers.BigNumber.from(30_000).mul(ethers.BigNumber.from(10).pow(18))
    );

    const DonationFactory = await ethers.getContractFactory("DonationFactory");
    const donationFactory = await DonationFactory.deploy(usdc.address);
    await usdc.approve(donationFactory.address, convertTo18Decimals(10_500));
    await donationFactory.createWhaleDonation(
      "Save The Whales",
      "Effort to halt commercial whaling",
      org.address,
      convertTo18Decimals(10_000),
      50,
      convertTo18Decimals(500),
      3600 * 24 * 30 // 30 days
    );
    const donationAddress = await donationFactory.allDonations(0);
    donation = Donation__factory.connect(donationAddress, whale);

    const donationAmount = convertTo18Decimals(1000);
    for (const u of [addr1, addr2, addr3, addr4]) {
      await usdc.transfer(u.address, donationAmount);

      await usdc.connect(u).approve(donationAddress, donationAmount);
      await donation.connect(u).donate(donationAmount);
    }

    await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
    await ethers.provider.send("evm_mine", []);
  });

  it("Should deploy and initialize challenge", async function () {
    await usdc
      .connect(challenger)
      .approve(await donation.factory(), convertTo18Decimals(50));
    await donation.connect(challenger).openChallenge("Simple vote");
    const challengeAddr = await donation.getRecentChallenge();
    challenge = Challenge__factory.connect(challengeAddr, challenger);

    const ts = (await ethers.provider.getBlock("latest")).timestamp;
    expect(await challenge.challenger()).to.equal(challenger.address);
    expect(await challenge.donation()).to.equal(donation.address);
    expect(await challenge.desc()).to.equal("Simple vote");
    expect(await challenge.getChallengeStatus()).to.equal(
      ChallengeStatus.Ongoing
    );
    const yesVotes = await challenge.yesVotes();
    const noVotes = await challenge.noVotes();
    const maxVoter = await challenge.maxVoter();
    expect(yesVotes).to.equal(0);
    expect(noVotes).to.equal(0);
    expect(maxVoter).to.equal(5);
    expect(await challenge.votableUntil()).to.equal(ts + 14 * 60 * 60 * 24);
  });

  it("Users should vote, non-users shouldnt vote", async function () {
    const challengeAsUser1 = Challenge__factory.connect(
      challenge.address,
      addr1
    );

    await challengeAsUser1.vote(true);
    await expect(challengeAsUser1.vote(true)).to.revertedWith("Already voted.");

    let yesVotes = await challenge.yesVotes();
    let noVotes = await challenge.noVotes();
    expect(yesVotes).to.equal(1);
    expect(noVotes).to.equal(0);

    const challengeAsUser2 = Challenge__factory.connect(
      challenge.address,
      addr2
    );

    await challengeAsUser2.vote(false);
    await expect(challengeAsUser2.vote(false)).to.revertedWith(
      "Already voted."
    );

    yesVotes = await challenge.yesVotes();
    noVotes = await challenge.noVotes();
    expect(yesVotes).to.equal(1);
    expect(noVotes).to.equal(1);

    const challengeAsUser3 = Challenge__factory.connect(
      challenge.address,
      addr3
    );

    await challengeAsUser3.vote(true);
    await expect(challengeAsUser3.vote(true)).to.revertedWith("Already voted.");

    yesVotes = await challenge.yesVotes();
    noVotes = await challenge.noVotes();
    expect(yesVotes).to.equal(2);
    expect(noVotes).to.equal(1);
  });

  it("Users couldnt close challenge early", async function () {
    await expect(challenge.closeChallenge()).to.revertedWith(
      "Vote period has not ended."
    );
  });

  it("Users couldnt vote late", async function () {
    await ethers.provider.send("evm_increaseTime", [14 * 60 * 60 * 24 + 1000]);
    await ethers.provider.send("evm_mine", []);

    const challengeAsUser4 = Challenge__factory.connect(
      challenge.address,
      addr4
    );

    await expect(challengeAsUser4.vote(true)).to.revertedWith(
      "Vote period has ended."
    );
  });

  it("User close challenge", async function () {
    await challenge.closeChallenge();

    await expect(challenge.closeChallenge()).to.revertedWith(
      "This challenge has ended."
    );

    expect(await challenge.getChallengeStatus()).to.equal(
      ChallengeStatus.Approved
    );
  });
});

function convertTo18Decimals(num: number) {
  return ethers.BigNumber.from(num).mul(ethers.BigNumber.from(10).pow(18));
}
