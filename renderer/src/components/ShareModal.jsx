import React, { useState } from 'react';
import Modal from 'react-modal';
import { styled } from 'styled-components';
import { io } from 'socket.io-client';

Modal.setAppElement('#root');

const ShareModal = (props) => {
  const [link, setLink] = useState('');
  const [accessType, setAccessType] = useState('anyone');
  const [usernames, setUsernames] = useState(['']);

  const handleAccessTypeChange = (event) => {
    setAccessType(event.target.value);
  };

  const handleUsernameChange = (event, index) => {
    const updatedUsernames = [...usernames];
    updatedUsernames[index] = event.target.value;
    setUsernames(updatedUsernames);
  };

  const handleAddUsernameField = () => {
    setUsernames([...usernames, '']);
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGenerateLink = async () => {
    const data = {
      sharePath: props.sharePath,
      user: props.user,
      allowed_clients: usernames,
    };
    try {
      const response = await fetch(
        `http://localhost:8080/generate-link/${data.user}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      if (response.ok) {
        const responseBody = await response.text();
        const linkWithoutQuotes = responseBody.replace(/^"(.*)"$/, '$1');
        setLink(linkWithoutQuotes);
      }
    } catch (err) {
      console.log('error generating link');
    }
  };

  return (
    <StyledModal
      isOpen={props.isOpen}
      onRequestClose={props.onRequestClose}
      contentLabel="Generate Link"
    >
      <ModalDiv>
        <ModalLabel>LINK</ModalLabel>
        <ModalInput type="text" value={link} readOnly />
        {link.length === 0 ? null : (
          <CopyLink onClick={handleCopyClick}>Copy</CopyLink>
        )}
        <div>
          <label>
            Access Type:
            <select value={accessType} onChange={handleAccessTypeChange}>
              <option value="anyone">Anyone with this link</option>
              <option value="select">Select users</option>
            </select>
          </label>

          {accessType === 'select' && (
            <div>
              <p>Enter usernames:</p>
              {usernames.map((username, index) => (
                <div key={index}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e, index)}
                  />
                  <button onClick={handleAddUsernameField}>Add User</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalDiv>
      <Generate onClick={handleGenerateLink}>Generate</Generate>
      <CloseBtn onClick={props.onRequestClose}>Close</CloseBtn>
    </StyledModal>
  );
};

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
`;
const ModalLabel = styled.div`
  margin: 5px;
`;

const DropDown = styled.select``;

export default ShareModal;
