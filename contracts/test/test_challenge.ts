import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Challenge, Challenge__factory } from "../typechain";

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
  let challenge: Challenge;
  const MAXVOTER = 3;

  before(async () => {
    [challenger, addr1, addr2, addr3, addr4] = await ethers.getSigners();
  });

  it("Should deploy and initialize challenge", async function () {
    const Challenge = await ethers.getContractFactory("Challenge");
    challenge = await Challenge.deploy(await addr1.address);

    await challenge.deployed();

    const ts = (await ethers.provider.getBlock("latest")).timestamp;
    await challenge.initialize(challenger.address, "Simple vote", MAXVOTER);
    expect(await challenge.getChallenger()).to.equal(challenger.address);
    expect(await challenge.getDonation()).to.equal(addr1.address);
    expect(await challenge.getDesc()).to.equal("Simple vote");
    expect(await challenge.getChallengeStatus()).to.equal(
      ChallengeStatus.Ongoing
    );
    const [yesVotes, noVotes, maxVoter] = await challenge.getVoteInfo();
    expect(yesVotes).to.equal(0);
    expect(noVotes).to.equal(0);
    expect(maxVoter).to.equal(MAXVOTER);
    // XXX : why +1 diff
    expect(await challenge.getVotableUntil()).to.equal(
      ts + 14 * 60 * 60 * 24 + 1
    );
  });

  it("Users should vote, non-users shouldnt vote", async function () {
    const challengeAsUser1 = Challenge__factory.connect(
      challenge.address,
      addr1
    );

    await challengeAsUser1.vote(true);
    await expect(challengeAsUser1.vote(true)).to.revertedWith("Already voted.");

    let [yesVotes, noVotes, maxVoter] = await challenge.getVoteInfo();
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

    [yesVotes, noVotes, maxVoter] = await challenge.getVoteInfo();
    expect(yesVotes).to.equal(1);
    expect(noVotes).to.equal(1);

    const challengeAsUser3 = Challenge__factory.connect(
      challenge.address,
      addr3
    );

    await challengeAsUser3.vote(true);
    await expect(challengeAsUser3.vote(true)).to.revertedWith("Already voted.");

    [yesVotes, noVotes, maxVoter] = await challenge.getVoteInfo();
    expect(yesVotes).to.equal(2);
    expect(noVotes).to.equal(1);
  });

  it("Users couldnt close challenge early", async function () {
    await expect(challenge.closeChallenge()).to.revertedWith(
      "Vote perioed has not ended."
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
      "Vote perioed has ended."
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
