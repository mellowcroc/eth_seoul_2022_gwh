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

let usdc: USDC;
let donationFactory: DonationFactory;
let donation: Donation;

const whaleFunding = 5000;
const userDonating = 1000;
const cbounty = 500;
const ccollateral = 50;

function convertTo18Decimals(num: number) {
  return ethers.BigNumber.from(num).mul(ethers.BigNumber.from(10).pow(18));
}

async function connectToExistContract() {
  [admin, org, whale, challenger, user1, user2, user3] =
    await ethers.getSigners();

  usdc = USDC__factory.connect(
    "0xeC3E29F9e5125eEA61E72b68EA84160dBc70E5e0",
    admin
  );

  donationFactory = DonationFactory__factory.connect(
    "0x6c294Ff10303a9EB811c239B9AeB15A549818f80",
    admin
  );

  donation = Donation__factory.connect(
    "0x2275A33Ab8765EaA8ef78Dd8aDA7509296Ac3450",
    admin
  );
}

async function generateFundingStateDonation() {
  await usdc
    .connect(whale)
    .approve(
      donationFactory.address,
      convertTo18Decimals(whaleFunding + cbounty)
    );
  const tx = await donationFactory.connect(whale).createWhaleDonation(
    "Funding State Donation",
    "Funding State Donation Desc",
    org.address,
    convertTo18Decimals(whaleFunding),
    50,
    convertTo18Decimals(cbounty), // bounty
    3600 * 24 * 30 // 30 days
  );
  await tx.wait(1);

  const donationAddress = await donationFactory.allDonations(
    (await donationFactory.donationCount()).toNumber() - 1
  );

  return Donation__factory.connect(donationAddress, whale);
}

async function generateEmissionStateDonation(donation?: Donation) {
  if (!donation) {
    donation = await generateFundingStateDonation();
  }

  const donationAmount = convertTo18Decimals(userDonating);
  for (const u of [user1, user2, user3]) {
    await usdc.connect(u).approve(donation.address, donationAmount);
    const tx = await donation.connect(u).donate(donationAmount);
    await tx.wait(1);

    console.log(`user: ${u.address} donated USDC ${donationAmount}`);
  }

  // await ethers.provider.send("evm_increaseTime", [3600 * 24 * 30]);
  // await ethers.provider.send("evm_mine", []);
  return donation;
}

async function main() {
  await connectToExistContract();

  const emiDonation = await generateEmissionStateDonation(donation);
  console.log(`Emission State Donation: ${emiDonation.address}`);
  console.log("===========================");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
