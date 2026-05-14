import { Server } from 'socket.io';
import logger from '../utils/logger.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
      methods: ['GET', 'POST']
    }
  });

  const namespaces = ['/user', '/ambulance', '/hospital', '/police'];
  namespaces.forEach((ns) => {
    const nsp = io.of(ns);
    nsp.on('connection', (socket) => {
      logger.info(`Socket connected to ${ns} - id=${socket.id}`);

      socket.on('join', (room) => {
        socket.join(room);
        logger.info(`${socket.id} joined room ${room} on ${ns}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected ${socket.id} from ${ns}`);
      });
    });
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected (root) ${socket.id}`);
  });

  return io;
};

export const getIo = () => io;

export const emitEvent = (namespace, event, payload) => {
  try {
    if (!io) {
      logger.warn('emitEvent: io not initialized');
      return;
    }

    if (namespace) {
      const nsp = io.of(namespace);
      nsp.emit(event, payload);
    } else {
      io.emit(event, payload);
    }
  } catch (err) {
    logger.error('emitEvent error', err);
  }
};
