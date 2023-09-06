import React from 'react';
import {styled} from 'styled-components';

const Home = () => {
  return (
    <Container>
      <Heading>
        Welcome to File<Span>X</Span>
      </Heading>
    </Container>
  );
};

const Heading = styled.h1``;

const Container = styled.div`
  height: 100vh;
  padding: 1px;
  display: flex;
  justify-content: center;
  margin-top: 23%;
`;

const Span = styled.span`
  color: #00ff00;
`;

export default Home;
