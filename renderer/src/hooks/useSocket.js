import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socketIoPort = process.env.REACT_APP_SOCKET_IO_PORT;

const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(`http://localhost:${socketIoPort}`);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;
