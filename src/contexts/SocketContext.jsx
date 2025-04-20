import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const isSocketEnabled = import.meta.env.VITE_ENABLE_SOCKET === 'true';
    const socketUrl = import.meta.env.VITE_APP_SOCKET_URL;

    if (isSocketEnabled && socketUrl) {
      const newSocket = io(socketUrl);
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
