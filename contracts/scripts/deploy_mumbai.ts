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

const donations = [
  {
    name: "Save The Whales",
    description: "Help save the whales by banning whale hunting in the Pacific",
  },
  {
    name: "UkraineDAO",
    description:
      "Help defend democracy by supporting Ukraine in its war efforts",
  },
  {
    name: "Save The Children",
    description:
      "Help improve the lives children through better education, health care, and economic opportunities",
  },
  {
    name: "GlobalGiving",
    description: "Donate to charity projects around the world",
  },
  {
    name: "World Vision",
    description:
      "Donate to help children, families, and communities affected by disasters and urgent needs",
  },
];

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

async function generateFundingStateDonation(index: number, duration: number) {
  // [admin, org, whale, challenger, user1, user2, user3, user4] =
  //   await ethers.getSigners();
  // usdc = USDC__factory.connect(
  //   "0xbdb1e43e83a89b0ecdb051b0ce45a87230a0714c",
  //   admin
  // );
  // donationFactory = DonationFactory__factory.connect(
  //   "0x51faff9691809778008ecb5341e658ed7c900fa6",
  //   admin
  // );
  const approveTx = await usdc
    .connect(whale)
    .approve(
      donationFactory.address,
      convertTo18Decimals(whaleFunding + cbounty)
    );
  await approveTx.wait(1);
  const createTx = await donationFactory.connect(whale).createWhaleDonation(
    donations[index].name,
    donations[index].description,
    org.address,
    convertTo18Decimals(whaleFunding),
    50,
    convertTo18Decimals(cbounty), // bounty
    duration
  );
  await createTx.wait(1);
  const donationAddress = await donationFactory.allDonations(
    (await donationFactory.donationCount()).toNumber() - 1
  );

  return Donation__factory.connect(donationAddress, whale);
}

async function main() {
  await deployContract();
  await distributeTokens();

  funDonation = await generateFundingStateDonation(1, 3600); // 1 hour
  console.log(`Funding State Donation: ${funDonation.address}`);
  console.log("===========================");

  funDonation = await generateFundingStateDonation(2, 3600 * 24); // 24 hours
  console.log(`Funding State Donation: ${funDonation.address}`);
  console.log("===========================");

  funDonation = await generateFundingStateDonation(3, 3600 * 24 * 7); // 1 week
  console.log(`Funding State Donation: ${funDonation.address}`);
  console.log("===========================");

  funDonation = await generateFundingStateDonation(4, 3600 * 24 * 30); // 1 month
  console.log(`Funding State Donation: ${funDonation.address}`);
  console.log("===========================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
