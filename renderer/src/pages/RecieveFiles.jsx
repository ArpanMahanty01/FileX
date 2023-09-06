import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { io } from 'socket.io-client';

function RecieveFile() {
  const [active, setActive] = useState(false);
  const [activeReq,setActiveReq] = useState([]);
  
  useEffect(() => {
    const socket = io('ws://localhost:8000', {
      withCredentials: false,
    });

    socket.on('senderReq',(details)=>{
        setActiveReq(prev=>[...prev,details])
    })
  
  }, []);

  const handleSelectedSender = (sender)=>{
    const socket = io('ws://localhost:8000', {
      withCredentials: true,
    });

    socket.emit('selectedSender',(sender));
  }

  const handleActive = () => {
    setActive(!active);
    const socket = io('ws://localhost:8000', {
      withCredentials: true,
    });
    socket.emit('getActive');
  };

  return (
    <Container>
      <ActiveButton active={active} onClick={handleActive}>
        {active ? 'Active' : 'Inactive'}
      </ActiveButton>
      <div>
        {activeReq.map((element)=>(
            <button onClick={()=>{handleSelectedSender(element)}}>{element.senderName}</button>
        ))}
      </div>
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

const ActiveButton = styled.button`
  background-color: ${(props) => (props.active ? 'green' : 'red')};
  height: 20px;
  width: 150px;
  margin-bottom: 20px;
`;

export default RecieveFile;
