import { useEthers } from '@usedapp/core';
import { useState } from 'react';
import styled from 'styled-components';
import Connect from '../../components/Connect';
import Header from '../../components/Header';

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

const CreateButton = styled.button`

`;

const _handleCreateDonation = async () => {}

export default function CreateDonation() {
  const { account } = useEthers();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [org, setOrg] = useState('');
  const [matchPool, setMatchPool] = useState(0);
  const [bountyPool, setBountyPool] = useState(0);
  const [matchPerc, setMatchPerc] = useState(0);
  const [matchExpireAt, setMatchExpireAt] = useState(0);

  return (
    <Container>
      <HeaderContainer>
        <Header />
      </HeaderContainer>
      <Content>
        <h1>
          Create a new donation
        </h1>

        {/* Create form */}
        { account && (
          <>
            <StyledInput
              value={name}
              placeholder='Name'
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
            <StyledInput
              value={description}
              placeholder='Description'
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
            <StyledInput
              value={org}
              placeholder='Charity Organization'
              onChange={(event) => {
                setOrg(event.target.value);
              }}
            />
            <StyledInput
              placeholder='Whale'
              value={account}
            />
            <StyledInput
              value={matchPool}
              placeholder='Match Pool'
              onChange={(event) => {
                setMatchPool(Number(event.target.value));
              }}
            />
            <StyledInput
              value={bountyPool}
              placeholder='Bounty Pool'
              onChange={(event) => {
                setBountyPool(Number(event.target.value));
              }}
            />
            <StyledInput
              value={matchPerc}
              placeholder='Match Percentage'
              onChange={(event) => {
                setMatchPerc(Number(event.target.value));
              }}
            />
            <StyledInput
              value={matchExpireAt}
              placeholder='Matching Expiration'
              onChange={(event) => {
                setMatchExpireAt(Number(event.target.value));
              }}
            />

            <CreateButton onClick={_handleCreateDonation}>
              Create!
            </CreateButton>
          </>) }

        {/* Connect Wallet Popup */}
        {
          !account && <Connect />
        }
      </Content>
    </Container>
  );
}
