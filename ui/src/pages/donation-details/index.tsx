import { useEthers } from "@usedapp/core";
import { useState } from "react";
import styled from "styled-components";
import Header from "../../components/Header";
import { useDonation } from "../../hooks/useDonation";
import { useQuery } from "../../hooks/useQuery";
const Wrapper = styled.div`
  text-align: center;
`;

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
  const donationId = query.get("id");
  const { account } = useEthers();
  // TODO(): get the actual data from ethereum
  const [donation, setDonation] = useState({
    id: donationId,
    name: `Donation ${donationId}`,
    stage: "Funding",
    description: "Description..... blabalbalbalblablalbllab",
    whaleAddress: "0xABCD...ABCD",
    orgAddress: "0x1234...1234",
    bountyPool: 1000,
    matchAmount: 50000,
    matchPercent: 100,
    matchExpireAt: new Date("2022-09-08").getTime(),
    userDonations: [],
    matchedTotal: 5000,
    challenges: [],
    reports: [],
  });
  const donationasdf = useDonation(
    "0xf700bc3b87201d07d8e7aa595cebb68bc206e358",
    ""
  );
  console.log("donationasdf: ", donationasdf);

  return (
    <Container>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <Content>
        <h1>{`Donation Details of "${query.get("id")}"`}</h1>

        <Id>ID: {donation.id}</Id>

        <Name>Name: {donation.name}</Name>

        <Description>Description: {donation.description}</Description>

        <Stage>Stage: {donation.stage}</Stage>

        <Organization>Organization: {donation.orgAddress}</Organization>

        <Whale>Whale: {donation.whaleAddress}</Whale>

        <MatchWrapper>
          Matching Info
          <MatchAmount>Matching Amount: {donation.matchAmount}</MatchAmount>
          <MatchPercent>
            Matching Percentage: {donation.matchPercent}
          </MatchPercent>
          <MatchExpireAt>
            Matching Expires At: {donation.matchExpireAt}
          </MatchExpireAt>
          <BountyPool>Bounty Pool: {donation.bountyPool}</BountyPool>
        </MatchWrapper>

        <UserDonationWrapper>
          User Donations
          {donation.userDonations.map((userDonation, index) => (
            <UserDonation key={`user-donation-${index}`}>
              {userDonation}
            </UserDonation>
          ))}
        </UserDonationWrapper>

        <ChallengeWrapper>
          Challenges
          {donation.challenges.map((challenge, index) => (
            <Challenge key={`challenge-${index}`}>{challenge}</Challenge>
          ))}
        </ChallengeWrapper>

        <ReportWrapper>
          Reports
          {donation.reports.map((report, index) => (
            <Report key={`report-${index}`}>{report}</Report>
          ))}
        </ReportWrapper>
      </Content>
    </Container>
  );
}
