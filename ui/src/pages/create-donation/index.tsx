import React, { useContext } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  text-align: center;
`;

const CreateButton = styled.button`

`;

const _handleCreateDonation = async () => {}

export default function CreateDonation() {

  return (
    <div>
      <Wrapper>
        <h1>
          Create a new donation
        </h1>

        <input
          placeholder='Name'
        />
        <input
          placeholder='Description'
        />
        <input
          placeholder='Charity Organization'
        />
        {/* Need to get the connected wallet address */}
        <input
          placeholder='Whale'
        />
        <input
          placeholder='Match Pool'
        />
        <input
          placeholder='Bounty Pool'
        />
        <input
          placeholder='Match Percentage'
        />
        <input
          placeholder='Matching Expiration'
        />

        <CreateButton onClick={_handleCreateDonation}>
          Create!
        </CreateButton>

      </Wrapper>
    </div>
  );
}
