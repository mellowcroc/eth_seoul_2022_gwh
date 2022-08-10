import { useEthers } from "@usedapp/core";
import { useState, useMemo } from "react";
import styled from "styled-components";
import Connect from "../../components/Connect";
import Header from "../../components/Header";
import { useDonation } from "../../hooks/useDonation";
import { DONATION_FACTORY, USDC_ADDRESS } from "../../contracts";
import { BigNumber, Contract } from "ethers";
import {
  donationAbi,
  donationFactoryAbi,
  challengeAbi,
  erc20Abi,
} from "../../abis";
import {
  USDC,
  Challenge__factory,
  Challenge,
  DonationFactory,
  DonationFactory__factory,
  Donation,
  Donation__factory,
} from "contracts";

function convertTo18Decimals(num: number) {
  return BigNumber.from(num).mul(BigNumber.from(10).pow(18));
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  min-height: 100vh;
`;

const HeaderContainer = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 9999;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 16px;
  min-height: 100vh;
  min-height: 100vh;
  gap: 40px;
  text-align: center;
  width: 100%;
  background: #c3d9eb;
  align-items: center;
  box-sizing: border-box;
`;

const StyledInput = styled("input")`
  all: unset;
  // padding: 16px;
  border-radius: 8px;
  width: 328px;
  max-width: 100%;
  box-sizing: border-box;
  text-align: left;
  font-size: 20px;
  font-weight: 500;
`;

const CreateButton = styled.button``;

export default function CreateDonation() {
  const { account, library } = useEthers();
  const [name, setName] = useState("Name1");
  const [description, setDescription] = useState("Desc1");
  const [org, setOrg] = useState("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  const [matchPool, setMatchPool] = useState(5000);
  const [bountyPool, setBountyPool] = useState(500);
  const [matchPerc, setMatchPerc] = useState(50);
  const [matchExpireAt, setMatchExpireAt] = useState(3600);

  const signer = useMemo(() => library?.getSigner(), [library]);
  const factory = useMemo<DonationFactory | undefined>(
    () =>
      signer
        ? (
          new Contract(
            DONATION_FACTORY,
            donationFactoryAbi,
            library
          ) as DonationFactory
        ).connect(signer)
        : undefined,
    [signer, library]
  );
  const usdc = useMemo<USDC | undefined>(
    () =>
      signer
        ? (new Contract(USDC_ADDRESS, erc20Abi, library) as USDC).connect(
          signer
        )
        : undefined,
    [signer, library]
  );

  const _handleCreateDonation = async () => {
    if (!factory || !usdc || !account) {
      alert("Connect wallet first");
      return;
    }

    console.log("Allowance : ", matchPool + bountyPool);
    const tx = await usdc.approve(
      DONATION_FACTORY,
      convertTo18Decimals(matchPool + bountyPool + 1000)
    );
    await tx.wait(1);
    console.log("MatchPool", matchPool);
    await factory.createWhaleDonation(
      name,
      description,
      org,
      convertTo18Decimals(matchPool),
      matchPerc,
      convertTo18Decimals(bountyPool),
      matchExpireAt
    );
  };

  return (
    <Container>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <Content>
        <h1>Create a new donation</h1>

        {/* Create form */}
        {account && (
          <>
            <StyledInput
              value={name}
              placeholder="Name"
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
            <StyledInput
              value={description}
              placeholder="Description"
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
            <StyledInput
              value={org}
              placeholder="Charity Organization"
              onChange={(event) => {
                setOrg(event.target.value);
              }}
            />
            <StyledInput placeholder="Whale" value={account} />
            <StyledInput
              value={matchPool}
              placeholder="Match Pool"
              onChange={(event) => {
                setMatchPool(Number(event.target.value));
              }}
            />
            <StyledInput
              value={bountyPool}
              placeholder="Bounty Pool"
              onChange={(event) => {
                setBountyPool(Number(event.target.value));
              }}
            />
            <StyledInput
              value={matchPerc}
              placeholder="Match Percentage"
              onChange={(event) => {
                setMatchPerc(Number(event.target.value));
              }}
            />
            <StyledInput
              value={matchExpireAt}
              placeholder="Matching Expiration"
              onChange={(event) => {
                setMatchExpireAt(Number(event.target.value));
              }}
            />

            <CreateButton onClick={_handleCreateDonation}>Create!</CreateButton>
          </>
        )}

        {/* Connect Wallet Popup */}
        {!account && <Connect />}
      </Content>
    </Container>
  );
}
