import React, { useState } from 'react';
import { styled } from 'styled-components';
import { NavLink } from 'react-router-dom';
import LinkModal from '../components/LinkModal';

function SendFile() {
  const electron = window.electron;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [path, setPath] = useState('');
  const [write, setWrite] = useState(false);

  const handleWriteChange = () => {
    setWrite(!write);
  };

  const handleFileChange = () => {
    window.ipcRenderer.send('open-file-dialog');

    window.ipcRenderer.on('file-dialog-result', (e, data) => {
      setPath(data.filePath);
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Container>
      <DeviceDetails>
        <div>
          The operating system type is <OS>{electron.osType()}</OS>
        </div>
      </DeviceDetails>
      <File>
        <Button onClick={handleFileChange}>Choose File</Button>
        {path ? <div>{path}</div> : null}
      </File>
      <Permissions>
        <Label write={write}>
          <Input type="checkbox" checked={write} onChange={handleWriteChange} />
          give Write Acces
        </Label>
        <Label>
          set password
          <input
            type="password"
            placeholder="you can keep it empty"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Label>
      </Permissions>
      <Buttons>
        <Button onClick={openModal}>generate Link</Button>
        <Button>
          <NavLink to="/send/find-devices" state={{path:path,write:write}}>
            find device to share
          </NavLink>
        </Button>
      </Buttons>
      <LinkModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        closeModal={closeModal}
        path={path}
        write={write}
        password={password}
      />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  margin-top: 100px;
`;

const Button = styled.button`
  background-color: gray !important;
  color: black;
  width: 300px;
  height: 50px;
  &:hover {
    background-color: white !important;
  }
`;

const Buttons = styled.div``;

const DeviceDetails = styled.div`
  margin: 15px;
`;

const File = styled.div`
  margin: 15px;
  padding: 5px;
  border: 1px solid white;
  width: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const OS = styled.span`
  color: #00ff00;
`;

const Permissions = styled.div`
  margin: 15px;
  padding: 5px;
  border: 1px solid white;
  width: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  margin: 5px;
  margin-right: 15px;
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-radius: 3px;
  outline: none;
  transition: background-color 0.2s;
  &:checked {
    background-color: white;
    border-color: gray;
  }
`;

const Label = styled.label`
  font-size: 12px;
  color: ${(props) => (props.write ? 'white' : 'gray')};
`;

export default SendFile;
