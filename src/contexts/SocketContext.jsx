import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { isSocketEnabled, SOCKET_URL } from '../api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isSocketEnabled === 'true' && SOCKET_URL) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
