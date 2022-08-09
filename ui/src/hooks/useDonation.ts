import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { useEthers } from "@usedapp/core";
import { Challenge__factory, DonationFactory__factory, Donation__factory } from "contracts";

interface Donation {
  token: string,
  id: number,
  name: string,
  description: string,
  stage: string,
  org: string,
  whale: string,
  whaleRefunded: boolean,
  whaleDonationMax: number,
  whaleDonationTotalAmount: number,
  bounty: number,
  matchPercentage: number,
  withdrawnAmount: number,
  createdAt: number,
  expireAt: number,
  emissionDuration: number,
  emissionRate: number,
  emissionStopped: boolean,
  donatedUsers: number,
  userDonationTotalAmount: number,
  challengesLength: number,
  reportsLength: number,
  refundMatch: boolean,
  refundAmountAfterStopped: number,
  bountyClaimed: boolean,
  myDonation: number,
  challenger?: string,
}

// TODO(): this may need to be moved to Donation.sol
function getStage(expireAt: number, emissionStopped: boolean) {
  const now = Date.now();
  if (emissionStopped) {
    return 'Stopped';
  }
  if (now < expireAt) {
    return 'Funding';
  }
  return '';
}

function isMyDonation(donation: Donation, myAddress: string) {
  return donation.org === myAddress || donation.whale === myAddress || donation.myDonation > 0 ||
      donation.challenger === myAddress;
}

export const useDonation = (donationFactoryAddress: string, walletAddress: string) => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  // TODO(): separate them by stages & my donations
  const { account, library } = useEthers();

  const fetchDonations = useCallback(async () => {
    if (!library) return;
    const myAddress = walletAddress || account;
    const donationFactory = DonationFactory__factory.connect(donationFactoryAddress, library);
    const numDonations = (await donationFactory.numDonations()).toNumber();
    const _donations = [];
    const _myDonations = [];
    for (let i = 0; i < numDonations; i++) {
      const donationAddress = await donationFactory.allDonations(i);
      const donation = Donation__factory.connect(donationAddress, library);
      const donationDataArr = (await donation.getDonationData())
        .map((x) => BigNumber.isBigNumber(x) ? x.toNumber() : x);
      const donationData: Donation = {
        token: donationDataArr[0] as string,
        id: donationDataArr[1] as number,
        name: donationDataArr[2] as string,
        description: donationDataArr[3] as string,
        stage: getStage(donationDataArr[13] as number * 1000, donationDataArr[16] as boolean),
        org: donationDataArr[4] as string,
        whale: donationDataArr[5] as string,
        whaleRefunded: donationDataArr[6] as boolean,
        whaleDonationMax: donationDataArr[7] as number,
        whaleDonationTotalAmount: donationDataArr[8] as number,
        bounty: donationDataArr[9] as number,
        matchPercentage: donationDataArr[10] as number,
        withdrawnAmount: donationDataArr[11] as number,
        createdAt: donationDataArr[12] as number,
        expireAt: donationDataArr[13] as number,
        emissionDuration: donationDataArr[14] as number,
        emissionRate: donationDataArr[15] as number,
        emissionStopped: donationDataArr[16] as boolean,
        donatedUsers: donationDataArr[17] as number,
        userDonationTotalAmount: donationDataArr[18] as number,
        challengesLength: donationDataArr[19] as number,
        reportsLength: donationDataArr[20] as number,
        refundMatch: donationDataArr[21] as boolean,
        refundAmountAfterStopped: donationDataArr[22] as number,
        bountyClaimed: donationDataArr[23] as boolean,
        myDonation: myAddress ? (await donation.userDonations(myAddress)).toNumber() : 0,
      };

      if (donationData.challengesLength > 0) {
        const recentChallengeAddress = await donation.getRecentChallenge();
        const recentChallenge = Challenge__factory.connect(recentChallengeAddress, library);
        const recentChallengeData = (await recentChallenge.getInfo())
          .map((x) => BigNumber.isBigNumber(x) ? x.toNumber() : x);
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
