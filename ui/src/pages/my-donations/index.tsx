import React, { useState, Component, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Slider from "react-slick";
import { useEthers } from '@usedapp/core';
// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Connect from '../../components/Connect';
import Header from '../../components/Header';
import { createClient, useQuery, Provider } from 'urql'
const APIURL = 'https://api.thegraph.com/subgraphs/name/jaehunkim/donationagg'

const tokensQuery = `
  query Users($account: ID!) {
    users (where: {id: $account}) {
      id
      donations
      amount
      total
    }
  }
`

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
  const { account } = useEthers();
  const client = createClient({
    url: APIURL,
  })

  async function fetchData() {
    if (!account)
      return;

    console.log("account: ", account);
    const response = await client.query(tokensQuery, { account: "0x1c0f17b556f3a4bad43a9606554c5760e4dc3b76" }).toPromise();
    console.log("response:", response);
    setDonationAmount(response.data.users[0].total);
    setDonationList(response.data.users[0].donations);
  }
  const [donationAmount, setDonationAmount] = useState(0);
  const [donationList, setDonationList] = useState([]);
  useEffect(() => {
    fetchData()
  }, [account]);
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
    <Container>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <Content>
        <h1>
          My Donations
        </h1>

        {/* My donation list */}
        {
          account && (
            <SliderWrapper>
              TOTAL FUNDING AMOUNT <br></br>
              {donationAmount / 1000000000000000000} <br></br>
              LIST OF FUNDING DONATIONS
              {donationList.map((address) => <h3>{address}</h3>)}
              <Slider {...sliderSettings}>
                {
                  donations
                    .map((donation: DonationPreview, index) => <DonationSlideItem donation={donation} key={index} />)
                }
              </Slider>
            </SliderWrapper>
          )
        }

        {/* Connect Wallet Popup */}
        {
          !account && <Connect />
        }
      </Content>
    </Container>
  );
}
