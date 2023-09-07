import React from 'react';
import { styled } from 'styled-components';

const Breadcrumbs=({ path, onBreadcrumbClick,setHome })=> {
  const segments = path.split('/').filter((segment) => segment !== '');

  return (
    <Container>
        <Link onClick={setHome}>Home/</Link>
      {segments.map((segment, index) => (
        <Span key={segment}>
          {index > 0 && ' / '}
          <Link onClick={() => onBreadcrumbClick(segment)}>{segment}</Link>
        </Span>
      ))}
    </Container>
  );
};

const Container = styled.div`
    height: 5vh;
    background-color: gray;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Link = styled.div`
    background-color: gray;
    &:hover{
        cursor: pointer;
        text-decoration: underline;
    }
`;
const Span = styled.span`
    display: flex;
    background-color: gray;
`;


export default Breadcrumbs;