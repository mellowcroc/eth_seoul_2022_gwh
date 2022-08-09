import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
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
let clsDonation: Donation;
let stpDonation: Donation;
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
    ethers.BigNumber.from(100_000).mul(ethers.BigNumber.from(10).pow(18))
  );
  console.log("USDC deployed to:", usdc.address);

  const DonationFactory = await ethers.getContractFactory("DonationFactory");
  donationFactory = await DonationFactory.deploy(usdc.address);
  console.log("Donation factory deployed to:", donationFactory.address);
  console.log("===========================");
}

async function distributeTokens() {
  console.log("Distributing tokens...");
  const whaleAmount = convertTo18Decimals((whaleFunding + cbounty) * 5);
  const userAmount = convertTo18Decimals(userDonating * 5);
  const challengerAmount = convertTo18Decimals(ccollateral);

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

async function generateFinishedStateDonation() {}

async function generateEmissionStateDonation() {}

async function generateChallengingStateDonation() {}

async function generateStoppedStateDonation() {}

async function generateFundingStateDonation() {
  await usdc
    .connect(whale)
    .approve(
      donationFactory.address,
      convertTo18Decimals(whaleFunding + cbounty)
    );
  await donationFactory.connect(whale).createWhaleDonation(
    "Funding State Donation",
    "Funding State Donation Desc",
    org.address,
    convertTo18Decimals(whaleFunding),
    50,
    convertTo18Decimals(cbounty), // bounty
    3600 * 24 * 30 // 30 days
  );
  const donationAddress = await donationFactory.allDonations(
    (await donationFactory.donationCount()).toNumber() - 1
  );
  funDonation = Donation__factory.connect(donationAddress, whale);

  console.log(`Funding State Donation: ${funDonation.address}`);
}

async function main() {
  await deployContract();
  await distributeTokens();
  await generateFinishedStateDonation();
  await generateFundingStateDonation();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
