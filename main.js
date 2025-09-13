"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = require("socket.io");
var io = new socket_io_1.Server({
    cors: {
        origin: '*',
    },
});
io.on("connection", function (socket) {
    socket.on("join-room", function (roomId) {
        socket.join(roomId);
    });
    socket.on("file-meta", function (roomId, meta) {
        socket.to(roomId).emit("file-meta", meta);
    });
    socket.on("file-chunk", function (roomId, chunk, progress) {
        socket.to(roomId).emit("file-chunk", chunk, progress);
    });
    socket.on("disconnect", function () {
    });
});
var PORT = 4000;
io.listen(PORT);
console.log("Socket.IO server running on port ".concat(PORT));
