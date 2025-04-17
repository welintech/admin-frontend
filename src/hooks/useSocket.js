import { useEffect } from 'react';
import { socketService } from '../services/socketService';

export const useSocket = () => {
  useEffect(() => {
    // Connect to socket server when component mounts
    socketService.connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return {
    emit: socketService.emit.bind(socketService),
    on: socketService.on.bind(socketService),
  };
};
