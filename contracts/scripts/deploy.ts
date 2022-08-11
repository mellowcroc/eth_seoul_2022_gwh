import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  Challenge,
  Challenge__factory,
  Donation,
  DonationFactory,
  Donation__factory,
  USDC,
  USDC__factory,
} from "../typechain";

let admin: SignerWithAddress;
let org: SignerWithAddress;
let whale: SignerWithAddress;
let challenger: SignerWithAddress;
let user1: SignerWithAddress;
let user2: SignerWithAddress;
let user3: SignerWithAddress;
let user4: SignerWithAddress;

let usdc: USDC;
let donationFactory: DonationFactory;
let funDonation: Donation;
let emiDonation: Donation;
let chaDonation: Donation;
let ongoingChallenge: Challenge;
let stpDonation: Donation;
let approvedChallenge: Challenge;
let finDonation: Donation;

const whaleFunding = 5000;
const userDonating = 1000;
const cbounty = 500;
const ccollateral = 50;

function convertTo18Decimals(num: number) {
  return ethers.BigNumber.from(num).mul(ethers.BigNumber.from(10).pow(18));
}

async function deployContract() {
  console.log("Deploying contracts...");
  [admin, org, whale, challenger, user1, user2, user3, user4] =
    await ethers.getSigners();

  const USDC = await ethers.getContractFactory("USDC");
  usdc = await USDC.deploy(
    ethers.BigNumber.from(100_000_000).mul(ethers.BigNumber.from(10).pow(18))
  );
  console.log("USDC deployed to:", usdc.address);

  const DonationFactory = await ethers.getContractFactory("DonationFactory");
  donationFactory = await DonationFactory.deploy(usdc.address);
  console.log("Donation factory deployed to:", donationFactory.address);
  console.log("===========================");
}

async function distributeTokens() {
  console.log("Distributing tokens...");
  const whaleAmount = convertTo18Decimals((whaleFunding + cbounty) * 500);
  const userAmount = convertTo18Decimals(userDonating * 5);
  const challengerAmount = convertTo18Decimals(ccollateral * 2);

  const transferTx1 = await usdc.transfer(whale.address, whaleAmount);
  await transferTx1.wait(1);
  console.log(`Distribute ${whale.address} USDC to ${whaleAmount}`);
  const transferTx2 = await usdc.transfer(challenger.address, challengerAmount);
  await transferTx2.wait(1);
  console.log(`Distribute ${challenger.address} USDC to ${challengerAmount}`);

  for (const u of [user1, user2, user3]) {
    const transferTx = await usdc.transfer(u.address, userAmount);
    await transferTx.wait(1);
    console.log(`Distribute ${u.address} USDC to ${userAmount}`);
  }
  console.log("===========================");
}

async function generateFundingStateDonation() {
  const approveTx = await usdc
    .connect(whale)
    .approve(
      donationFactory.address,
      convertTo18Decimals(whaleFunding + cbounty)
    );
  await approveTx.wait(1);
  const createTx = await donationFactory.connect(whale).createWhaleDonation(
    "Funding State Donation",
    "Funding State Donation Desc",
    org.address,
    convertTo18Decimals(whaleFunding),
    50,
    convertTo18Decimals(cbounty), // bounty
    3600 * 24 * 30 // 30 days
  );
  await createTx.wait(1);
  const donationAddress = await donationFactory.allDonations(
    (await donationFactory.donationCount()).toNumber() - 1
  );

  return Donation__factory.connect(donationAddress, whale);
}

async function generateEmissionStateDonation() {
  const donation = await generateFundingStateDonation();

  const donationAmount = convertTo18Decimals(userDonating);
  for (const u of [user1, user2, user3]) {
    const approveTx = await usdc
      .connect(u)
      .approve(donation.address, donationAmount);
    await approveTx.wait(1);
    const donateTx = await donation.connect(u).donate(donationAmount);
    await donateTx.wait(1);
  }

  await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
  await ethers.provider.send("evm_mine", []);
  return donation;
}

async function generateFinishedStateDonation() {
  const donation = await generateFundingStateDonation();

  const donationAmount = convertTo18Decimals(userDonating);
  for (const u of [user1, user2, user3]) {
    const approveTx = await usdc
      .connect(u)
      .approve(donation.address, donationAmount);
    await approveTx.wait(1);
    const donateTx = await donation.connect(u).donate(donationAmount);
    await donateTx.wait(1);
  }

  await ethers.provider.send("evm_increaseTime", [3600 * 24 * 360]);
  await ethers.provider.send("evm_mine", []);

  console.log(`Finished State Donation: ${donation.address}`);
  console.log("===========================");
  return donation;
}

async function generateChallengingStateDonation(): Promise<
  [Donation, Challenge]
> {
  const donation = await generateEmissionStateDonation();

  await ethers.provider.send("evm_increaseTime", [3600 * 24 * 60]);
  await ethers.provider.send("evm_mine", []);

  const approveTx = await usdc
    .connect(challenger)
    .approve(await donation.factory(), convertTo18Decimals(ccollateral));
  await approveTx.wait(1);
  const challengeTx = await donation
    .connect(challenger)
    .openChallenge("Simple challenge");
  await challengeTx.wait(1);
  const challengeAddr = await donation.getRecentChallenge();
  const challenge = Challenge__factory.connect(challengeAddr, challenger);

  return [donation, challenge];
}

async function generateStoppedStateDonation(): Promise<[Donation, Challenge]> {
  const [donation, challenge] = await generateChallengingStateDonation();

  const voteTx1 = await challenge.connect(user1).vote(true);
  await voteTx1.wait(1);
  const voteTx2 = await challenge.connect(user2).vote(true);
  await voteTx2.wait(1);
  const voteTx3 = await challenge.connect(whale).vote(true);
  await voteTx3.wait(1);

  await ethers.provider.send("evm_increaseTime", [3600 * 24 * 15]);
  await ethers.provider.send("evm_mine", []);

  const closeTx = await challenge.connect(admin).closeChallenge();
  await closeTx.wait(1);
  const stopTx = await donation.connect(admin).stop();
  await stopTx.wait(1);

  return [donation, challenge];
}

async function main() {
  await deployContract();
  await distributeTokens();
  finDonation = await generateFinishedStateDonation();

  emiDonation = await generateEmissionStateDonation();
  console.log(`Emission State Donation: ${emiDonation.address}`);
  console.log("===========================");

  [stpDonation, approvedChallenge] = await generateStoppedStateDonation();
  console.log(`Stopped State Donation: ${stpDonation.address}`);
  console.log(`Approved Challenge: ${approvedChallenge.address}`);
  console.log("===========================");

  [chaDonation, ongoingChallenge] = await generateChallengingStateDonation();
  console.log(`Challenge State Donation: ${chaDonation.address}`);
  console.log(`Ongoing Challenge: ${ongoingChallenge.address}`);
  console.log("===========================");

  funDonation = await generateFundingStateDonation();
  console.log(`Funding State Donation: ${funDonation.address}`);
  console.log("===========================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
