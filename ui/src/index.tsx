import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { ChainId, DAppProvider, Config } from "@usedapp/core";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
const config: Config = {
  readOnlyChainId: ChainId.Mumbai,
  readOnlyUrls: {
    [ChainId.Mumbai]:
      "https://polygon-mumbai.g.alchemy.com/v2/WOoOVulx3jcn_plLu_rMKYXbBGX-BRvG",
  },
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
