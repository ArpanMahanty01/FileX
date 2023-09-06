import React, { useState } from 'react';
import Modal from 'react-modal';
import { styled } from 'styled-components';

Modal.setAppElement('#root');

function LinkModal(props) {
  const [link,setLink] = useState('');
  const path = props.path;
  const write = props.write;
  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGenerateLink = ()=>{
    const socket = io(`ws://localhost:8000`, {
      withCredentials: true,
    });
    const data = {
      path:path,
      write:write
    }
    socket.emit('generate-link',(data))
  }

  return (
    <StyledModal
      isOpen={props.isOpen}
      onRequestClose={props.closeModal}
      contentLabel="Generate Link"
    >
      <ModalDiv>
        <ModalLabel>LINK</ModalLabel>
        <ModalInput type="text" value={link} readOnly />
        {
          link.length===0? null :<CopyLink onClick={handleCopyClick}>Copy</CopyLink>
        }
      </ModalDiv>
      
      <Generate onClick={handleGenerateLink}>Generate</Generate>
      <CloseBtn onClick={props.closeModal}>Close</CloseBtn>
    </StyledModal>
  );
}

const StyledModal = styled(Modal)`
  background-color: black;
  position: fixed;
  top: 25%;
  left: 25%;
  display: flex;
  width: 50%;
  height: 50%;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border: 15px solid white;
`;

const ModalDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const ModalInput = styled.input`
  background-color: white;
  color: black;
  height: 20px;
  width: 100%;
`;

const CopyLink = styled.button`
  width: 50%;
  height: 40px;
  margin-top: 10px;
  background-color: gray;
  &:hover {
    background-color: white;
    color: black;
    transform: scale(1.1);
  }
`;
const CloseBtn = styled.button`
  background-color: red;
  width: 40%;
  text-align: center;
  margin: 20px;
  height: 10%;
  &:hover {
    transform: scale(1.1);
  }
`;

const Generate = styled.button`
   background-color: green;
  width: 40%;
  text-align: center;
  margin: 20px;
  height: 10%;
  &:hover {
    transform: scale(1.1);
  }
`
const ModalLabel = styled.div`
  margin: 5px;
`;


export default LinkModal;
