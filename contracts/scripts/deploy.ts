import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  Challenge,
  Challenge__factory,
  Donation,
  DonationFactory,
  DonationFactory__factory,
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

  // const USDC = await ethers.getContractFactory("USDC");
  // usdc = await USDC.deploy(
  //   ethers.BigNumber.from(100_000).mul(ethers.BigNumber.from(10).pow(18))
  // );
  // console.log("USDC deployed to:", usdc.address);

  // const DonationFactory = await ethers.getContractFactory("DonationFactory");
  // donationFactory = await DonationFactory.deploy(usdc.address);
  // console.log("Donation factory deployed to:", donationFactory.address);
  // console.log("===========================");
}

async function distributeTokens() {
  console.log("Distributing tokens...");
  const whaleAmount = convertTo18Decimals((whaleFunding + cbounty) * 5);
  const userAmount = convertTo18Decimals(userDonating * 5);
  const challengerAmount = convertTo18Decimals(ccollateral * 2);

  await usdc.transfer(whale.address, whaleAmount);
  console.log(`Distribute ${whale.address} USDC to ${whaleAmount}`);
  await usdc.transfer(challenger.address, challengerAmount);
  console.log(`Distribute ${challenger.address} USDC to ${challengerAmount}`);

  for (const u of [user1, user2, user3]) {
    await usdc.transfer(u.address, userAmount);
    console.log(`Distribute ${u.address} USDC to ${userAmount}`);
  }
  console.log("===========================");
}

async function generateFundingStateDonation() {
  console.log("1");
  usdc = USDC__factory.connect(
    "0xE5DbB1fA316f46D46F9BA2736f0993B18b853858",
    ethers.provider
  );
  donationFactory = DonationFactory__factory.connect(
    "0xF700BC3B87201D07D8E7Aa595cebb68BC206e358",
    ethers.provider
  );
  const approveTx = await usdc
    .connect(whale)
    .approve(
      donationFactory.address,
      convertTo18Decimals(whaleFunding + cbounty)
    );
  await approveTx.wait(1);
  console.log("2");
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
    await usdc.connect(u).approve(donation.address, donationAmount);
    await donation.connect(u).donate(donationAmount);
  }

  await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
  await ethers.provider.send("evm_mine", []);
  return donation;
}

async function generateFinishedStateDonation() {
  const donation = await generateFundingStateDonation();

  const donationAmount = convertTo18Decimals(userDonating);
  for (const u of [user1, user2, user3]) {
    await usdc.connect(u).approve(donation.address, donationAmount);
    await donation.connect(u).donate(donationAmount);
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

  await usdc
    .connect(challenger)
    .approve(await donation.getDAOAddress(), convertTo18Decimals(ccollateral));
  await donation.connect(challenger).openChallenge("Simple challenge");
  const challengeAddr = await donation.getRecentChallenge();
  const challenge = Challenge__factory.connect(challengeAddr, challenger);

  return [donation, challenge];
}

async function generateStoppedStateDonation(): Promise<[Donation, Challenge]> {
  const [donation, challenge] = await generateChallengingStateDonation();

  await challenge.connect(user1).vote(true);
  await challenge.connect(user2).vote(true);
  await challenge.connect(whale).vote(true);

  await ethers.provider.send("evm_increaseTime", [3600 * 24 * 15]);
  await ethers.provider.send("evm_mine", []);

  await challenge.connect(admin).closeChallenge();
  await donation.connect(admin).stop();

  return [donation, challenge];
}

async function main() {
  await deployContract();
  // await distributeTokens();
  // finDonation = await generateFinishedStateDonation();

  // emiDonation = await generateEmissionStateDonation();
  // console.log(`Emission State Donation: ${emiDonation.address}`);
  // console.log("===========================");

  // [stpDonation, approvedChallenge] = await generateStoppedStateDonation();
  // console.log(`Stopped State Donation: ${stpDonation.address}`);
  // console.log(`Approved Challenge: ${approvedChallenge.address}`);
  // console.log("===========================");

  // [chaDonation, ongoingChallenge] = await generateChallengingStateDonation();
  // console.log(`Challenge State Donation: ${chaDonation.address}`);
  // console.log(`Ongoing Challenge: ${ongoingChallenge.address}`);
  // console.log("===========================");

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
