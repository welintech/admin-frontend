import io from 'socket.io-client';
import { SOCKET_URL } from '../api';
import { toast } from 'react-toastify';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
      // Socket connected
    });

    socket.on('error', (error) => {
      // Handle socket error
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    // Replace with your actual socket server URL
    this.socket = io(
      process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001'
    );

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('notification', (data) => {
      toast.info(data.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error occurred');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

export const socketService = new SocketService();
