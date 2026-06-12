const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory queues and active room tracking
let queue = [];
let activeRooms = new Map(); // roomId -> { caller: { socketId, user }, callee: { socketId, user } }

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. Join queue
  socket.on('join-queue', (userData) => {
    if (!userData || !userData.uid) {
      console.warn('Invalid user details received on join-queue');
      return;
    }

    // Clean up any stale sessions for this user in queue
    queue = queue.filter(item => item.user.uid !== userData.uid);

    console.log(`User ${userData.name} (${userData.uid}) joined queue`);

    // Find if there's a match available
    const matchIndex = queue.findIndex(item => item.user.uid !== userData.uid);

    if (matchIndex !== -1) {
      // Match found!
      const partner = queue[matchIndex];
      queue.splice(matchIndex, 1);

      const roomId = `room_${socket.id}_${partner.socketId}`;

      // Join both to socket room
      socket.join(roomId);
      const partnerSocket = io.sockets.sockets.get(partner.socketId);
      if (partnerSocket) {
        partnerSocket.join(roomId);
      }

      // Track active room
      activeRooms.set(roomId, {
        caller: { socketId: socket.id, user: userData },
        callee: { socketId: partner.socketId, user: partner.user }
      });

      console.log(`Match success: ${userData.name} matched with ${partner.user.name} in room ${roomId}`);

      // Emit match success events
      // Designer caller/initiator (socket) and callee (partner)
      socket.emit('match-found', {
        roomId,
        initiator: true,
        partner: partner.user
      });

      if (partnerSocket) {
        partnerSocket.emit('match-found', {
          roomId,
          initiator: false,
          partner: userData
        });
      }
    } else {
      // Add to queue
      queue.push({
        socketId: socket.id,
        user: userData
      });
      console.log(`Added user to queue. Current queue length: ${queue.length}`);
    }
  });

  // 2. Relay WebRTC signaling payload
  socket.on('signal', ({ roomId, signalData }) => {
    if (!roomId || !signalData) return;
    socket.to(roomId).emit('signal', signalData);
  });

  // 3. Leave queue manually
  socket.on('leave-queue', () => {
    queue = queue.filter(item => item.socketId !== socket.id);
    console.log(`Socket left queue: ${socket.id}`);
  });

  // 4. Leave room or skip
  socket.on('leave-room', ({ roomId }) => {
    handleLeaveRoom(socket, roomId);
  });

  // 5. Connection closed
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Remove from queue if present
    queue = queue.filter(item => item.socketId !== socket.id);

    // Check if user was in an active room
    for (const [roomId, roomInfo] of activeRooms.entries()) {
      if (roomInfo.caller.socketId === socket.id || roomInfo.callee.socketId === socket.id) {
        handleLeaveRoom(socket, roomId);
        break;
      }
    }
  });
});

function handleLeaveRoom(socket, roomId) {
  if (!roomId) return;
  const roomInfo = activeRooms.get(roomId);

  if (roomInfo) {
    console.log(`Cleaning up room: ${roomId}`);
    // Notify peer that partner left
    socket.to(roomId).emit('peer-left');

    // Remove sockets from room
    socket.leave(roomId);
    
    const peerSocketId = roomInfo.caller.socketId === socket.id 
      ? roomInfo.callee.socketId 
      : roomInfo.caller.socketId;

    const peerSocket = io.sockets.sockets.get(peerSocketId);
    if (peerSocket) {
      peerSocket.leave(roomId);
    }

    activeRooms.delete(roomId);
  }
}

// Health Check API
app.get('/health', (req, res) => {
  res.json({ status: 'OK', queueSize: queue.length, activeRoomsCount: activeRooms.size });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Matchmaking & Signaling Server listening on port ${PORT}`);
});
