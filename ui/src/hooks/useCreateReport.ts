import { useCallback, useState, useMemo } from "react";
import { BigNumberish, Contract } from "ethers";
import { Donation } from "contracts";
import { useEthers } from "@usedapp/core";
import { donationAbi } from "../abis";

export const enum TxState {
  BUILDING,
  PENDING,
  CONFIRMED,
}

export const useCreateReport = (donationAddress: string) => {
  const { library } = useEthers();
  const [txState, setTxState] = useState<TxState>(TxState.BUILDING);
  const signer = useMemo(() => library?.getSigner(), [library]);
  const donation = useMemo<Donation | undefined>(
    () =>
      signer
        ? (new Contract(donationAddress, donationAbi, signer) as Donation)
        : undefined,
    [signer, donationAddress]
  );
  const createReport = useCallback(
    async (ipfsHash: string) => {
      donation
        ?.createReport(ipfsHash)
        .then((tx) => {
          setTxState(TxState.PENDING);
          tx.wait()
            .then(() => setTxState(TxState.CONFIRMED))
            .catch((err) => alert(err.toString()));
        })
        .catch((err) => {
          alert(err.toString());
        });
    },
    [donation]
  );
  return { createReport, txState };
};
