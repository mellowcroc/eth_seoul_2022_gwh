import React, { useState, Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Slider from "react-slick";
// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Wrapper = styled.div`
  text-align: center;
  width: 100%;
`;

const SliderWrapper = styled.div`
  padding: 60px;
`

const CreateButton = styled.button`
  color: #000;
  width: 200px;
`;

const MyPageButton = styled.button`
  color: #000;
  width: 200px;
`;

const DonationTitle = styled.div`
  text-decoration: underline;
`;

interface DonationPreview {
  id: string,
  name: string,
  description: string,
  whaleAddress: string,
  orgAddress: string,
}

interface ISlideItemProps {
  donation: DonationPreview,
}

class DonationSlideItem extends Component<ISlideItemProps> {
  render() {
    const { donation, ...props } = this.props;
    return (
      <div {...props}>
        <DonationTitle>{donation.name}</DonationTitle>
        <div>{donation.description}</div>
        <div>Org: {donation.orgAddress}</div>
        <div>Whale: {donation.whaleAddress}</div>
        <Link to={`/donation-details?id=${donation.id}`}>See details</Link>
      </div>
    );
  }
}


export default function Home() {
  const sliderSettings = {
    // NOTE(): for other settings, see https://react-slick.neostack.com/docs/example/simple-slider
    infinite: true,
    className: "center",
    centerPadding: "60px",
    swipeToSlide: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    speed: 500
  };

  // TODO(): get the actual data from ethereum
  const [fundingDonations, setFundingDonations] = useState([
    {
      id: 'funding1',
      name: 'Donation # 1',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'funding2',
      name: 'Donation # 2',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'funding3',
      name: 'Donation # 3',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'funding4',
      name: 'Donation # 4',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'funding5',
      name: 'Donation # 5',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
  ]);
  // TODO(): get the actual data from ethereum
  const [emittingDonations, setEmittingDonations] = useState([
    {
      id: 'emitting1',
      name: 'Emitting Donation # 1',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'emitting2',
      name: 'Emitting Donation # 2',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'emitting3',
      name: 'Emitting Donation # 3',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'emitting4',
      name: 'Emitting Donation # 4',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'emitting5',
      name: 'Emitting Donation # 5',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
  ]);
  // TODO(): get the actual data from ethereum
  const [finishedDonations, setFinishedDonations] = useState([
    {
      id: 'finished1',
      name: 'Finished Donation # 1',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'finished2',
      name: 'Finished Donation # 2',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'finished3',
      name: 'Finished Donation # 3',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'finished4',
      name: 'Finished Donation # 4',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'finished5',
      name: 'Finished Donation # 5',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
  ]);

  return (
    <div style={{width: '100%'}}>
      <Wrapper>
        <h1>
          Good Whale Hunting
        </h1>

        <CreateButton>
          <Link to='/create-donation'>Create a new donation</Link>
        </CreateButton>

        <MyPageButton>
          <Link to='/my-donations'>View my donations</Link>
        </MyPageButton>

        {/* Funding donations */}
        <SliderWrapper>
          LIST OF FUNDING DONATIONS
          <Slider {...sliderSettings}>
            {
              fundingDonations
                .map((donation: DonationPreview, index) => <DonationSlideItem donation={donation} key={index}/>)
            }
          </Slider>
        </SliderWrapper>

        {/* Emitting donations */}
        <SliderWrapper>
          LIST OF EMITTING DONATIONS
          <Slider {...sliderSettings}>
            {
              emittingDonations
                .map((donation: DonationPreview, index) => <DonationSlideItem donation={donation} key={index}/>)
            }
          </Slider>
        </SliderWrapper>

        {/* Stopped / Finished donations */}
        <SliderWrapper>
          LIST OF PAST DONATIONS
          <Slider {...sliderSettings}>
            {
              finishedDonations
                .map((donation: DonationPreview, index) => <DonationSlideItem donation={donation} key={index}/>)
            }
          </Slider>
        </SliderWrapper>
      </Wrapper>
    </div>
  );
}
