import React, { useState, Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Slider from "react-slick";
// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Wrapper = styled.div`
  text-align: center;
`;

const SliderWrapper = styled.div`
  padding: 60px;
`

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

export default function MyDonations() {
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
  const [donations, setDonations] = useState([
    {
      id: 'funding1',
      name: 'Donation # 1',
      stage: 'Funding',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'funding2',
      name: 'Donation # 2',
      stage: 'Funding',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'emitting1',
      name: 'Donation # 3',
      stage: 'Emitting',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'finished4',
      name: 'Donation # 4',
      stage: 'Finished',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
    {
      id: 'finished5',
      name: 'Donation # 5',
      stage: 'Finished',
      description: 'Description..... blabalbalbalblablalbllab',
      whaleAddress: '0xABCD...ABCD',
      orgAddress: '0x1234...1234',
    },
  ]);

  return (
    <div>
      <Wrapper>
        <h1>
          My Donations
        </h1>

        <SliderWrapper>
          LIST OF FUNDING DONATIONS
          <Slider {...sliderSettings}>
            {
              donations
                .map((donation: DonationPreview, index) => <DonationSlideItem donation={donation} key={index}/>)
            }
          </Slider>
        </SliderWrapper>
      </Wrapper>
    </div>
  );
}
