import React, { memo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  height: 64px;
  padding: 12px 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;

  & > img {
    cursor: pointer;
  }

  z-index: 9999;
`;

const MenuContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  cursor: pointer;
  color: black;
`;

const MenuLink = styled(Link)`
  font-size: 16px;
`;

// const MenuItemContainer = styled("div")`
//   width: 100%;
//   position: absolute;
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
//   background: #ffffff;
//   left: 0;
//   top: 64px;
//   width: 100%;
//   box-sizing: border-box;
// `;

// const MenuItem = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 100%;
//   height: 60px;
// `;


function Header() {

  // TODO(): fix styles. clean up unused code.
  return (
    <Container>
      <MenuContainer>
        Good Whale Hunting
        <MenuLink to='/create-donation'>
          Are you a Whale?
        </MenuLink>
        <MenuLink to='/my-donations'>
          My Donations
        </MenuLink>
      </MenuContainer>
    </Container>
  );
}

export default memo(Header);
