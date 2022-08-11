import { useEthers } from "@usedapp/core";
import { useState, useMemo } from "react";
import { utils, BigNumber, Contract } from "ethers";
import styled from "styled-components";
import Header from "../../components/Header";
import { useDonation } from "../../hooks/useDonation";
import { ChallengeInterface } from "../../hooks/useDonations";
import { useQuery } from "../../hooks/useQuery";
import { DONATION_FACTORY, USDC_ADDRESS } from "../../contracts";
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
import ProgressBar from "react-bootstrap/ProgressBar";
const https = require("https");
require("dotenv").config();
var ipfsClient = require("ipfs-http-client");

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

const Id = styled.div``;

const Name = styled.div``;

const Description = styled.div``;

const Stage = styled.div``;

const Organization = styled.div``;

const Whale = styled.div``;

const MatchWrapper = styled.div``;
const MatchAmount = styled.div``;
const MatchPercent = styled.div``;
const MatchExpireAt = styled.div``;
const BountyPool = styled.div``;

const CreateButton = styled.button``;

// const UserDonationWrapper = styled.div``;
// const UserDonation = styled.div``;

const ChallengeWrapper = styled.div``;
const ChallengeEntity = styled.div``;

// const ReportWrapper = styled.div``;
// const Report = styled.div``;
export default function DonationDetails() {
  const query = useQuery();
  const donationAddress = query.get("address") || "";
  console.log("donationAddress: ", donationAddress);
  const { account, library } = useEthers();
  const { donation } = useDonation(donationAddress, ""); // TODO
  console.log("donation: ", donation);
  const [donationAmount, setDonationAmount] = useState(1000);

  const projectId = process.env.INFURA_PROJECT_ID;
  const projectSecret = process.env.INFURA_PROJECT_SECRET;
  console.log("process.env: ", process.env);
  console.log("projectId: ", projectId);
  console.log("projectSecret: ", projectSecret);
  const auth =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
  const client = ipfsClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });
  // client.pin
  //   .add("QmeGAVddnBSnKc1DLE7DLV9uuTqo5F7QbaveTjr45JUdQn")
  //   .then((res: any) => {
  //     console.log(res);
  //   });

  const [fileUrl, updateFileUrl] = useState(``);
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    try {
      const added = await client.add(file);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      updateFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  const signer = useMemo(() => library?.getSigner(), [library]);
  const donationContract = useMemo<Donation | undefined>(
    () =>
      signer
        ? (
            new Contract(donationAddress, donationAbi, library) as Donation
          ).connect(signer)
        : undefined,
    [signer, library, donationAddress]
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
  const challengeContract = useMemo<Challenge | undefined>(
    () =>
      signer && donationContract && donation && donation.recentchallengeaddr
        ? (
            new Contract(
              donation.recentchallengeaddr,
              challengeAbi,
              library
            ) as Challenge
          ).connect(signer)
        : undefined,
    [signer, library, donationContract, donation]
  );

  const _handleUserChallenge = async () => {
    if (
      !donationContract ||
      !usdc ||
      !account ||
      !donationAddress ||
      !donation
    ) {
      alert("Connect wallet first");
      return;
    }

    const tx = await usdc.approve(donationAddress, donation.bounty);
    await tx.wait(1);
    console.log("Bounty amount : ", donation.bounty);
    await donationContract.openChallenge("ChallengeDesc");
  };

  const _handleVoteYes = async () => {
    if (!challengeContract) {
      alert("Connect wallet first");
      return;
    }

    await challengeContract.vote(true);
  };

  const _handleVoteNo = async () => {
    if (!challengeContract) {
      alert("Connect wallet first");
      return;
    }

    await challengeContract.vote(false);
  };

  const _handleUserDonation = async () => {
    if (!donationContract || !usdc || !account || !donationAddress) {
      alert("Connect wallet first");
      return;
    }

    const tx = await usdc.approve(
      donationAddress,
      convertTo18Decimals(donationAmount)
    );
    await tx.wait(1);
    console.log("Donation amount : ", donationAmount);
    await donationContract.donate(convertTo18Decimals(donationAmount));
  };

  return (
    <Container>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <Content>
        {donation === null || donation === undefined ? (
          <></>
        ) : (
          <>
            <h1>{`Donation Details`}</h1>

            <Id>Contract address: {donation.contractAddress}</Id>

            <Name>Name: {donation.name}</Name>

            <Description>Description: {donation.description}</Description>

            <Stage>Stage: {donation.stage}</Stage>

            <Organization>Organization: {donation.org}</Organization>

            <Whale>Whale: {donation.whale}</Whale>

            <MatchWrapper>
              Matching Info
              <MatchAmount>
                Matching Amount:{" "}
                {utils.formatUnits(donation.whaleDonationTotalAmount)}
              </MatchAmount>
              <MatchPercent>
                Matching Percentage: {donation.matchPercentage}
              </MatchPercent>
              <MatchExpireAt>
                Matching Expires At:{" "}
                {new Date(donation.expireAt * 1000).toLocaleString()}
              </MatchExpireAt>
              <BountyPool>
                Bounty Pool: {utils.formatUnits(donation.bounty)} USDC
              </BountyPool>
            </MatchWrapper>

            {donation.challengesLength === 0 || !donation.recentchallenge ? (
              <></>
            ) : (
              <ChallengeWrapper>
                Recent Challenge Info
                <ChallengeEntity>
                  challenger: {donation.recentchallenge.challenger}
                </ChallengeEntity>
                <ChallengeEntity>
                  desc: {donation.recentchallenge.desc}
                </ChallengeEntity>
                <ChallengeEntity>
                  votableUntil:{" "}
                  {new Date(
                    donation.recentchallenge.votableUntil * 1000
                  ).toLocaleString()}
                </ChallengeEntity>
                <ChallengeEntity>
                  <ProgressBar
                    striped
                    now={
                      (donation.recentchallenge.yesVotes /
                        donation.recentchallenge.maxVoter) *
                      100
                    }
                    label={`${
                      (donation.recentchallenge.yesVotes /
                        donation.recentchallenge.maxVoter) *
                      100
                    }%`}
                  />
                  Votes(yes/no(max)): {donation.recentchallenge.yesVotes}/
                  {donation.recentchallenge.noVotes} (
                  {donation.recentchallenge.maxVoter})
                </ChallengeEntity>
                <ChallengeEntity>
                  Status: {donation.recentchallenge.status}
                </ChallengeEntity>
                <CreateButton onClick={_handleVoteYes}>Vote yes!!</CreateButton>
                <CreateButton onClick={_handleVoteNo}>Vote no!!</CreateButton>
              </ChallengeWrapper>
            )}

            <CreateButton onClick={_handleUserChallenge}>
              Challenge!!
            </CreateButton>

            <StyledInput
              value={donationAmount}
              placeholder="Donation Amount"
              onChange={(event) => {
                setDonationAmount(Number(event.target.value));
              }}
            />

            <CreateButton onClick={_handleUserDonation}>Donate!!</CreateButton>

            <div className="App">
              <h1>IPFS Example</h1>
              <input type="file" onChange={onChange} />
              {fileUrl && <img src={fileUrl} width="600px" />}
            </div>

            {
              //  P2
              /* <UserDonationWrapper>
                User Donations
                {
                  donation.userDonations
                    .map((userDonation, index) =>
                      <UserDonation key={`user-donation-${index}`}>{userDonation}</UserDonation>)
                }
              </UserDonationWrapper> */
            }

            {/* <ChallengeWrapper>
                Challenges
                {
                  donation.challenges
                    .map((challenge, index) =>
                      <Challenge key={`challenge-${index}`}>{challenge}</Challenge>)
                }
              </ChallengeWrapper> */}

            {/* <ReportWrapper>
                Reports
                {
                  donation.reports
                    .map((report, index) =>
                      <Report key={`report-${index}`}>{report}</Report>)
                }
              </ReportWrapper> */}
          </>
        )}
      </Content>
    </Container>
  );
}
