import { Routes, Route } from "react-router-dom";
import { useEthers, useTokenBalance } from "@usedapp/core";
import { utils } from "ethers";
import "./App.css";
import Connect from "./components/Connect";
import Home from "./pages";
import MyDonations from "./pages/my-donations";
import CreateDonation from "./pages/create-donation";
import DonationDetails from "./pages/donation-details";
import styled from "styled-components";
import { useERC20Balance } from "./hooks/useERC20Balance";

const Header = styled.header`
  width: 100%;
`;

function App() {
  const { chainId, active, account } = useEthers();
  console.log("ethers state:", chainId, active, account);
  // const balance = useERC20Balance(
  //   utils.getAddress("0x5fbdb2315678afecb367f032d93f642f64180aa3")
  // );
  const balance = useTokenBalance(
    "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    account
  );
  console.log("balance: ", balance);

  return (
    <div className="App">
      <Header className="App-header">
        <Connect />
        {balance}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-donations" element={<MyDonations />} />
          <Route path="/create-donation" element={<CreateDonation />} />
          <Route path="/donation-details" element={<DonationDetails />} />
        </Routes>
      </Header>
    </div>
  );
}

export default App;
