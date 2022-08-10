import { useEthers } from "@usedapp/core";
import { useState } from "react";
import { utils } from "ethers";
import styled from "styled-components";
import Header from "../../components/Header";
import { useDonation } from "../../hooks/useDonation";
import { useQuery } from "../../hooks/useQuery";
import { DONATION_FACTORY } from "../../contracts";

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

const UserDonationWrapper = styled.div``;
const UserDonation = styled.div``;

const ChallengeWrapper = styled.div``;
const Challenge = styled.div``;

const ReportWrapper = styled.div``;
const Report = styled.div``;

export default function DonationDetails() {
  const query = useQuery();
  const donationAddress = query.get("address") || "";
  console.log("donationAddress: ", donationAddress);
  const { account } = useEthers();
  const { donation } = useDonation(donationAddress, ""); // TODO
  console.log("donation: ", donation);

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
