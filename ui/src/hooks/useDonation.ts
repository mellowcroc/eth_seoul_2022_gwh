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
import { DonationInterface, convertToDonationInterface } from "./useDonations";

function isMyDonation(donation: DonationInterface, myAddress: string) {
  return (
    donation.org === myAddress ||
    donation.whale === myAddress ||
    donation.myDonation > 0 ||
    donation.challenger === myAddress
  );
}

export const useDonation = (donationAddress: string, walletAddress: string) => {
  const [donation, setDonation] = useState<DonationInterface>();
  const [myDonation, setMyDonation] = useState<Boolean>();
  // TODO(): separate them by stages & my donations
  const { account, library } = useEthers();

  const fetchDonations = useCallback(async () => {
    if (!library) return;
    const myAddress = walletAddress || account;
    const _donation = new Contract(
      donationAddress,
      donationAbi,
      library
    ) as Donation;
    const donationDataArr = await _donation.getDonationData();
    const myDonationAmount = myAddress
      ? Number(
          (await _donation.userDonations(myAddress)).toBigInt() / BigInt(10e18)
        )
      : 0;
    const donationData: DonationInterface = convertToDonationInterface(
      donationAddress,
      donationDataArr,
      myDonationAmount
    );

    if (donationData.challengesLength > 0) {
      const recentChallengeAddress = await _donation.getRecentChallenge();
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
    setDonation(donationData);
    setMyDonation(myAddress ? isMyDonation(donationData, myAddress) : false);
  }, [library, account, walletAddress, donationAddress]);

  useEffect(() => {
    fetchDonations();
    library?.on("block", fetchDonations);
    return () => {
      library?.off("block", fetchDonations);
    };
  }, [library, fetchDonations]);

  return { donation };
};
