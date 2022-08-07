import React, { useContext } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  text-align: center;
`;

export default function DonationDetails() {

  return (
    <div>
      <Wrapper>
        <h1>
          Donation Details
        </h1>
        {/* 
        - id
        - name
        - description
        - stage
        - orgAddress
        - whaleAddress
        - matchAmount // matchAmountTotal?
            - minimum 5,000 USDC
        - bountyPool
            - minimum 500 USDC
        - matchPerc
            - range: [10% ~]
        - matchExpireAt
        - mapping(address ⇒ uint256) userDonations
        - matchedTotal
        - challenges
        - Report[] reports
        */}
      </Wrapper>
    </div>
  );
}
