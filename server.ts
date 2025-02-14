import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";
import { Server } from "socket.io";
import { createServer } from "http";


const startServer = async () => {
  await connectDB();
  const port = config.port || 3000;
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });



  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log("User Connected", socket.id);

    // socket.on("message", ({ room, message }) => {
    //   console.log({ room, message });
    //   socket.to(room).emit("receive-message", message);
    // });

    // socket.on("join-room", (room) => {
    //   socket.join(room);
    //   console.log(`User joined room ${room}`);
    // });

    // Handle private messages
    socket.on("private-message", (messageData) => {
      const { receiverId } = messageData;
      
      // Emit the message only to the specific receiver
      socket.to(receiverId).emit("private-message", messageData);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
