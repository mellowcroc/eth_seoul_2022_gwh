import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { useEthers, useContractFunction } from "@usedapp/core";
import { Challenge__factory, DonationFactory__factory, Donation__factory } from "contracts";

interface Donation {
    token: string,
  }
  
export const useDonation = (donationFactoryAddress: string, walletAddress: string) => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [myDonations, setMyDonations] = useState<Donation[]>([]);
    const { account, library } = useEthers();   
    const fetchDonations = useCallback(async () => {
        if (!library) return;
        const fac = DonationFactory__factory.connect(donationFactoryAddress, library);
    }, [library, account, walletAddress, donationFactoryAddress]);
    useEffect(() => {
        fetchDonations();
        library?.on("block", fetchDonations);
        return () => {
          library?.off("block", fetchDonations);
        };
    }, [library, fetchDonations]);

    return { donations, myDonations };
}
