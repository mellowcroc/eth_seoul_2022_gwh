import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { ChainId, DAppProvider, Config } from "@usedapp/core";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { multicall } from "contracts";

const config: Config = {
  // readOnlyChainId: ChainId.Rinkeby,
  readOnlyChainId: 1337,
  readOnlyUrls: {
    // [ChainId.Rinkeby]:
    //   "https://eth-rinkeby.alchemyapi.io/v2/V6l_Y5sPj9-vkb-OHcLfMpCVLbKdYEAm",
    1337: "http://127.0.0.1:8545",
  },
  // multicallAddresses: {
  //   31337: multicall.address,
  // },
};
ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
