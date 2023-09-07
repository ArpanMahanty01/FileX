import React from 'react';
import { NavLink } from 'react-router-dom';
import { styled } from 'styled-components';

function Navbar() {
  return (
    <Container>
      <StyledLink to="/send">SEND</StyledLink>
      <StyledLink to="/receive">RECEIVE</StyledLink>
      <StyledLinkHome to="/">HOME</StyledLinkHome>
    </Container>
  );
}

const Container = styled.div`
  background-color: black;
  display: flex;
`;

const StyledLink = styled(NavLink)`
  text-decoration: none;
  margin: 5px;
  color: green;
  &.active {
    color: #00ff00;
  }
  &:hover{
    color: #00ff00;
  }
`;
const StyledLinkHome = styled(NavLink)`
  text-decoration: none;
  margin: 5px;
  color: green;
  margin-left: auto;
  &.active {
    color: #00ff00;
  }
`;

export default Navbar;
