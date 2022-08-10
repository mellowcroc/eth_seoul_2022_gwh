import { useCallback, useEffect, useState } from "react";
import { BigNumber, Contract } from "ethers";
import { useEthers } from "@usedapp/core";
import {
  Challenge__factory,
  Challenge,
  DonationFactory,
  DonationFactory__factory,
  Donation,
  Donation__factory,
} from "contracts";
import { donationAbi, donationFactoryAbi, challengeAbi } from "../abis";

export interface DonationInterface {
  contractAddress: string;
  token: string;
  id: number;
  name: string;
  description: string;
  stage: string;
  org: string;
  whale: string;
  whaleRefunded: boolean;
  whaleDonationMax: BigNumber;
  whaleDonationTotalAmount: BigNumber;
  bounty: BigNumber;
  matchPercentage: number;
  withdrawnAmount: BigNumber;
  createdAt: number;
  expireAt: number;
  emissionDuration: number;
  emissionRate: number;
  emissionStopped: boolean;
  donatedUsers: number;
  userDonationTotalAmount: BigNumber;
  challengesLength: number;
  reportsLength: number;
  refundMatch: boolean;
  refundAmountAfterStopped: BigNumber;
  bountyClaimed: boolean;
  myDonation: number;
  challenger?: string;
}

export function convertToDonationInterface(
  donationAddress: string,
  donationDataArr: any,
  myDonation: number
) {
  return {
    contractAddress: donationAddress,
    token: donationDataArr[0] as string,
    id: donationDataArr[1].toNumber(),
    name: donationDataArr[2] as string,
    description: donationDataArr[3] as string,
    stage: donationDataArr[4] as string,
    org: donationDataArr[5] as string,
    whale: donationDataArr[6] as string,
    whaleRefunded: donationDataArr[7] as boolean,
    whaleDonationMax: donationDataArr[8],
    whaleDonationTotalAmount: donationDataArr[9],
    bounty: donationDataArr[10],
    matchPercentage: donationDataArr[11].toNumber(),
    withdrawnAmount: donationDataArr[12],
    createdAt: donationDataArr[13].toNumber(),
    expireAt: donationDataArr[14].toNumber(),
    emissionDuration: donationDataArr[15].toNumber(),
    emissionRate: donationDataArr[16].toNumber(),
    emissionStopped: donationDataArr[17] as boolean,
    donatedUsers: donationDataArr[18].toNumber(),
    userDonationTotalAmount: donationDataArr[19],
    challengesLength: donationDataArr[20].toNumber(),
    reportsLength: donationDataArr[21].toNumber(),
    refundMatch: donationDataArr[22] as boolean,
    refundAmountAfterStopped: donationDataArr[23],
    bountyClaimed: donationDataArr[24] as boolean,
    myDonation: myDonation,
  };
}

function isMyDonation(donation: DonationInterface, myAddress: string) {
  return (
    donation.org === myAddress ||
    donation.whale === myAddress ||
    donation.myDonation > 0 ||
    donation.challenger === myAddress
  );
}

export const useDonations = (
  donationFactoryAddress: string,
  walletAddress: string
) => {
  const [donations, setDonations] = useState<DonationInterface[]>([]);
  const [myDonations, setMyDonations] = useState<DonationInterface[]>([]);
  // TODO(): separate them by stages & my donations
  const { account, library } = useEthers();

  const fetchDonations = useCallback(async () => {
    if (!library) return;
    const myAddress = walletAddress || account;
    const donationFactory = new Contract(
      donationFactoryAddress,
      donationFactoryAbi,
      library
    ) as DonationFactory;
    const numDonations = (await donationFactory.numDonations()).toNumber();
    const _donations = [];
    const _myDonations = [];
    for (let i = 0; i < numDonations; i++) {
      const donationAddress = await donationFactory.allDonations(i);
      const donation = new Contract(
        donationAddress,
        donationAbi,
        library
      ) as Donation;
      const donationDataArr = await donation.getDonationData();
      const myDonationAmount = myAddress
        ? Number(
            (await donation.userDonations(myAddress)).toBigInt() / BigInt(10e18)
          )
        : 0;
      const donationData: DonationInterface = convertToDonationInterface(
        donationAddress,
        donationDataArr,
        myDonationAmount
      );

      if (donationData.challengesLength > 0) {
        const recentChallengeAddress = await donation.getRecentChallenge();
        const recentChallenge = new Contract(
          recentChallengeAddress,
          challengeAbi,
          library
        ) as Challenge;
        const recentChallengeData = (await recentChallenge.getInfo()).map((x) =>
          BigNumber.isBigNumber(x) ? x.toNumber() : x
        );
        donationData.challenger = recentChallengeData[0] as string;
      }
      _donations.push(donationData);
      if (myAddress && isMyDonation(donationData, myAddress)) {
        _myDonations.push(donationData);
      }
    }
    setDonations(_donations);
    setMyDonations(_myDonations);
  }, [library, account, walletAddress, donationFactoryAddress]);

  useEffect(() => {
    fetchDonations();
    library?.on("block", fetchDonations);
    return () => {
      library?.off("block", fetchDonations);
    };
  }, [library, fetchDonations]);

  return { donations, myDonations };
};
