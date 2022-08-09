import { useCallback } from "react";
import { useEthers } from "@usedapp/core";
import WalletConnectProvider from "@walletconnect/web3-provider";

export const useWalletConnect = (alchemyapi: string) => {
  const { activate } = useEthers();
  const activateWalletConnect = useCallback(async () => {
    const provider = new WalletConnectProvider({
      rpc: alchemyapi,
      qrcode: true,
    });
    try {
      await provider.enable();
      await activate(provider);
    } catch (e) {
      console.log("Couldn't connect to the walletconnect connector");
    }
  }, [activate, alchemyapi]);
  return { activateWalletConnect };
};
