import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { Socket } from 'net';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketWithServer extends Socket {
  server: NetServer & {
    io?: ServerIO;
  };
}

interface ResponseWithSocket extends NextApiResponse {
  socket: SocketWithServer;
}

export default function ioHandler(req: NextApiRequest, res: ResponseWithSocket) {
  if (!res.socket.server.io) {
    const path = '/api/socket';
    const httpServer: NetServer = res.socket.server;
    
    // Enable CORS for development
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    io.on("connection", (socket) => {
      // Client identifies themselves
      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`Socket client joined room: ${userId}`);
      });
      
      socket.on("send_message", (data) => {
        // Broadcast the message immediately to the receiver's room
        io.to(data.receiverId).emit("receive_message", data);
      });
      
      socket.on("disconnect", () => {
        console.log("Socket client disconnected");
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
