import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (process.env.REACT_APP_ENABLE_SOCKET_IO === 'true') {
      const socketUrl =
        process.env.REACT_APP_API_URL?.replace('/api', '') ||
        'http://localhost:5000';
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
