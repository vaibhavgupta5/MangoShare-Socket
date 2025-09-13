import { Server, Socket } from "socket.io";

const io = new Server({
  cors: {
    origin: '*',
  },
});

interface FileMeta {
  filename: string;
  sharer: string;
  size: number;
}

io.on("connection", (socket: Socket) => {
  socket.on("join-room", (roomId: string) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;
    if (numClients >= 2) {
      socket.emit("room-full", roomId);
      return;
    }
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
    socket.emit("joined-room", roomId);

    const updatedRoom = io.sockets.adapter.rooms.get(roomId);
    if (updatedRoom && updatedRoom.size === 2) {
      const [user1, user2] = Array.from(updatedRoom);
      io.to(user1).emit("receiver-joined", user2);
      io.to(user2).emit("receiver-joined", user2);
    }
  });

  socket.on("file-meta", (roomId: string, meta: FileMeta) => {
    socket.to(roomId).emit("file-meta", meta);
  });

  socket.on("file-chunk", (roomId: string, chunk: ArrayBuffer, progress: number) => {
    socket.to(roomId).emit("file-chunk", chunk, progress);
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-left", socket.id);
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room || room.size < 2) {
          if (room && room.size === 1) {
            const [senderId] = Array.from(room);
            io.to(senderId).emit("receiver-left", socket.id);
          } else {
            io.to(roomId).emit("receiver-left", socket.id);
          }
        }
      }
    }
  });
});

const PORT = parseInt(process.env.PORT || "4000", 10);
io.listen(PORT);
console.log(`🥭 MangoShare Socket.IO server running on port ${PORT}`);