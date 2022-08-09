import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { useEthers } from "@usedapp/core";
import { ERC20__factory } from "contracts";

export const useERC20Balance = (tokenAddress: string, holder?: string) => {
  const [balance, setBalance] = useState<BigNumber>();
  const { account, library } = useEthers();

  const fetchBalance = useCallback(async () => {
    if (!library) return;
    console.log("library: ", library);
    // const token = ERC20__factory.connect(tokenAddress, library);
    // const _holder = holder || account;
    // if (!_holder) return;
    // const _balance = await token.balanceOf(_holder);
    // setBalance(_balance);
  }, [library, tokenAddress, holder, account]);

  useEffect(() => {
    fetchBalance();
    // library?.on("block", fetchBalance);
    // return () => {
    //   library?.off("block", fetchBalance);
    // };
  }, [library, fetchBalance]);

  return balance;
};
