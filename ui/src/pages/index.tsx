import React, { useState, Component } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Slider from "react-slick";
// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "../components/Header";
import { useDonations } from "../hooks/useDonations";
import { DONATION_FACTORY } from "../contracts";

const HeaderContainer = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 9999;
`;

const MainContainer = styled.div`
  text-align: center;
  width: 100%;
  background: #c3d9eb;
  // display: flex;
  // flex-direction: column;
  // flex-wrap: nowrap;
  align-items: center;
  // padding: calc(100vw / 4) 16px 110px 16px;
  box-sizing: border-box;
  // gap: 16px;
`;

const HeroImage = styled.div`
  width: 100vw;
  // height: 100%;
  aspect-ratio: 1292 / 865;
  overflow: hidden;
  position: absolute;
  top: 64px;
  background: url("/whale.jpg");
  background-size: 105% auto;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  image-rendering: -webkit-optimize-contrast;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

const SliderContainer = styled.div`
  padding: 30px;
  display: block;
`;

const Content = styled.div`
  z-index: 10;
  position: relative;
`;

const MainPhrase = styled.h2`
  margin: 50px;
  font-size: 50px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CreateButton = styled(Link)`
  height: 60px;
  padding: 30px;
  font-size: 20px;
  text-decoration: none;
  background: rgba(0, 140, 210, 0.5);
  border-radius: 100px;
  color: #fff;
  width: fit-content;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const MyPageButton = styled(Link)`
  height: 30px;
  padding: 20px;
  font-size: 20px;
  text-decoration: none;
  background: transparent;
  color: #fff;
  border: 5px solid #fff7;
  border-radius: 100px;
  width: fit-content;
  display: flex;
  align-items: center;
`;

const DonationItem = styled.div`
  // padding: 2%;
  text-decoration: none;
  color: #fff;
  background: #1674bee8;
  position: relative;
  text-align: center;
  font-size: 18px;
  display: flex;
  align-items: center;
  border-radius: 50px;
`;

const DonationInner = styled.div`
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`;

const DonationTitle = styled.div`
  font-weight: 800;
  padding-bottom: 10px;
`;

const DonationLink = styled(Link)`
  font-size: 14px;
  color: #fff;
  padding-top: 8px;
`;

interface DonationPreview {
  address: string;
  name: string;
  description: string;
  whaleAddress: string;
  orgAddress: string;
}

interface ISlideItemProps {
  donation: DonationPreview;
}

class DonationSlideItem extends Component<ISlideItemProps> {
  render() {
    const { donation, ...props } = this.props;
    return (
      <div style={{ margin: "10px", padding: "2%" }}>
        <DonationItem {...props}>
          <DonationInner>
            <DonationTitle>{donation.name}</DonationTitle>
            <div>Description: {donation.description}</div>
            {/* <div>Contract: {donation.address}</div> */}
            {/* <div>Whale: {donation.whaleAddress}</div> */}

            <DonationLink to={`/donation-details?address=${donation.address}`}>
              See details
            </DonationLink>
          </DonationInner>
        </DonationItem>
      </div>
    );
  }
}

export default function Home() {
  const sliderSettings = {
    // NOTE(): for other settings, see https://react-slick.neostack.com/docs/example/simple-slider
    infinite: true,
    speed: 500,
    dots: true,
    variableWidth: true,
    // className: "center",
    centerPadding: "60px",
    swipeToSlide: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    // speed: 500
  };

  const { donations, myDonations } = useDonations(DONATION_FACTORY, "");
  const fundingDonations = [];
  const emittingDonations = [];
  const finishedDonations = [];
  console.log("donations length: ", donations.length);
  for (let i = 0; i < donations.length; i++) {
    if (donations[i].stage === "Funding") {
      fundingDonations.push({
        address: donations[i].contractAddress,
        name: donations[i].name,
        description: donations[i].description,
        whaleAddress: donations[i].whale,
        orgAddress: donations[i].org,
      });
    } else if (donations[i].stage === "Emitting") {
      emittingDonations.push({
        address: donations[i].contractAddress,
        name: donations[i].name,
        description: donations[i].description,
        whaleAddress: donations[i].whale,
        orgAddress: donations[i].org,
      });
    } else if (
      donations[i].stage === "Finished" ||
      donations[i].stage === "Stopped"
    ) {
      finishedDonations.push({
        address: donations[i].contractAddress,
        name: donations[i].name,
        description: donations[i].description,
        whaleAddress: donations[i].whale,
        orgAddress: donations[i].org,
      });
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <MainContainer>
        <HeroImage />
        <Content>
          {/* ?????? ??? ?????? phrase ???????????????!! */}
          <MainPhrase>Do the most good possible with what you have.</MainPhrase>

          <ButtonWrapper>
            <CreateButton to="/create-donation">
              Create a new donation
            </CreateButton>
            <MyPageButton to="/my-donations">View my donations</MyPageButton>
          </ButtonWrapper>

          {/* Funding donations */}
          <SliderContainer>
            <h3>Funding Donations</h3>
            <Slider {...sliderSettings}>
              {fundingDonations.map((donation: DonationPreview, index) => (
                <DonationSlideItem donation={donation} key={index} />
              ))}
            </Slider>
          </SliderContainer>

          {/* Emitting donations */}
          <SliderContainer>
            <h3>Emitting Donations</h3>
            <Slider {...sliderSettings}>
              {emittingDonations.map((donation: DonationPreview, index) => (
                <DonationSlideItem donation={donation} key={index} />
              ))}
            </Slider>
          </SliderContainer>

          {/* Stopped / Finished donations */}
          <SliderContainer>
            <h3>Past Donations</h3>
            <Slider {...sliderSettings}>
              {finishedDonations.map((donation: DonationPreview, index) => (
                <DonationSlideItem donation={donation} key={index} />
              ))}
            </Slider>
          </SliderContainer>
        </Content>
      </MainContainer>
    </div>
  );
}
