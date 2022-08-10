import { Routes, Route } from "react-router-dom";
import { useEthers } from "@usedapp/core";
import "./App.css";
import Connect from "./components/Connect";
import Home from "./pages";
import MyDonations from "./pages/my-donations";
import CreateDonation from "./pages/create-donation";
import DonationDetails from "./pages/donation-details";
import styled from "styled-components";

const Header = styled.header`
  width: 100%;
`;

function App() {
  const { chainId, active, account } = useEthers();
  console.log("ethers state:", chainId, active, account);

  return (
    <div className="App">
      <Header className="App-header">
        {chainId !== 80001 && <Connect />}
        {chainId === 80001 && (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-donations" element={<MyDonations />} />
            <Route path="/create-donation" element={<CreateDonation />} />
            <Route path="/donation-details" element={<DonationDetails />} />
          </Routes>
        )}
      </Header>
    </div>
  );
}

export default App;
