import { useEthers } from '@usedapp/core';
import { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  text-align: center;
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
    <div>
      <Wrapper>
        <h1>
          Create a new donation
        </h1>

        {/* Create form */}
        { account && (
          <>
            <input
              value={name}
              placeholder='Name'
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
            <input
              value={description}
              placeholder='Description'
              onChange={(event) => {
                setDescription(event.target.value);
              }}
            />
            <input
              value={org}
              placeholder='Charity Organization'
              onChange={(event) => {
                setOrg(event.target.value);
              }}
            />
            <input
              placeholder='Whale'
              value={account}
            />
            <input
              value={matchPool}
              placeholder='Match Pool'
              onChange={(event) => {
                setMatchPool(Number(event.target.value));
              }}
            />
            <input
              value={bountyPool}
              placeholder='Bounty Pool'
              onChange={(event) => {
                setBountyPool(Number(event.target.value));
              }}
            />
            <input
              value={matchPerc}
              placeholder='Match Percentage'
              onChange={(event) => {
                setMatchPerc(Number(event.target.value));
              }}
            />
            <input
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
          !account && <div>Connect Wallet!</div>
        }
      </Wrapper>
    </div>
  );
}
