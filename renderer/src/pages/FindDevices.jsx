import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import RippleAnimation from '../components/RippleAnimation';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';

function FindDevices() {
  const location = useLocation();
  const { path, write } = location.state;
  const [activeReceivers, setActiveReceivers] = useState([]);
  const [user, setUser] = useState('');
  const [selectedButtonIndices, setSelectedButtonIndices] = useState([]);
  useEffect(() => {
    const socket = io(`ws://localhost:8000`, {
      withCredentials: true,
    });

    socket.emit('findUser');
    socket.on('activeReceiver', (receiver) => {
      setActiveReceivers((prevReceivers) => [...prevReceivers, receiver]);
    });
  }, [path, write, setActiveReceivers]);

  const handleSelectedUser = (receiver, index) => {
    setUser(receiver.username);
    if (selectedButtonIndices.includes(index)) {
      setSelectedButtonIndices(
        selectedButtonIndices.filter((i) => i !== index)
      );
    } else {
      setSelectedButtonIndices([...selectedButtonIndices, index]);
    }
    const userDetails = {
      username: receiver.username,
      ip: receiver.ip,
      path: path,
      write: write,
    };
    const socket = io(`ws://localhost:8000`, {
      withCredentials: true,
    });
    socket.emit('selectedReciever',userDetails)
  };

  return (
    <Container>
      <NavLink to="/send">Back</NavLink>
      <RippleAnimation />
      <SelecUser>
        <h2>Active Receivers:</h2>
        <Ul>
          {activeReceivers.map((recieve, index) => (
            <li key={index}>
              <Button
                style={{
                  backgroundColor: selectedButtonIndices.includes(index)
                    ? '#00ff00'
                    : 'green',
                }}
                onClick={() => handleSelectedUser(recieve, index)}
              >{`${recieve.username}`}</Button>
            </li>
          ))}
        </Ul>
        {user ? `file shared with ${user}` : null}
      </SelecUser>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  margin-top: 20px;
`;

const SelecUser = styled.div`
  margin-top: 20%;
`;

const Ul = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const Button = styled.button`
  width: 200px;
  height: 30px;
  margin-bottom: 15px;
  background-color: green;
  color: black;
  &:hover {
    background-color: #00ff00;
    transform: scale(1.1);
  }
`;

export default FindDevices;
