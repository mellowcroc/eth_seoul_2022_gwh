import React from "react";
import { useEthers } from "@usedapp/core";
import { useWalletConnect } from "../hooks/useWalletConnect";
const ALCHEMY_API =
  "https://eth-rinkeby.alchemyapi.io/v2/V6l_Y5sPj9-vkb-OHcLfMpCVLbKdYEAm";

function Connect() {
  const { chainId, account, activateBrowserWallet, library } = useEthers();
  const { activateWalletConnect } = useWalletConnect(ALCHEMY_API);

  return (
    <div>
      {!!library && chainId !== 80001 && (
        <button
          onClick={async () => {
            try {
              await library.send("wallet_switchEthereumChain", [
                { chainId: "0x13881" },
              ]);
            } catch (error) {
              console.log(error);
            }
          }}
        >
          Switch network!
        </button>
      )}
      {!account && (
        <button onClick={() => activateBrowserWallet()}>
          Connect browser wallet
        </button>
      )}
      {!account && (
        <button onClick={activateWalletConnect}>Connect wallet connect</button>
      )}
    </div>
  );
}

export default Connect;
