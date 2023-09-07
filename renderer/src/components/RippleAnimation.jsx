import React from 'react';
import styled, { keyframes } from 'styled-components';

const RippleAnimation = () => {
  return (
    <CirclesContainer>
      <Circle />
      <Circle />
      <Circle />
    </CirclesContainer>
  );
};

const growAndFade = keyframes`
  0% {
    opacity: 0.25;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
`;

const CirclesContainer = styled.div`
  height: 90vmin;
  position: relative;
  width: 90vmin;
`;

const Circle = styled.div`
  animation: ${growAndFade} 3s infinite ease-out;
  background-color: #00ff00;
  border-radius: 50%;
  height: 100%;
  opacity: 0;
  position: absolute;
  width: 100%;

  &:nth-child(1) {
    animation-delay: 1s;
  }
  &:nth-child(2) {
    animation-delay: 2s;
  }
  &:nth-child(3) {
    animation-delay: 3s;
  }
`;

export default RippleAnimation;
