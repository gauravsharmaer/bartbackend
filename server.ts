import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/config/db";
import { Server } from "socket.io";
import { createServer } from "http";

interface ConnectedUser {
  socketId: string;
  userId: string;
  username: string;
}

const connectedUsers: ConnectedUser[] = [];

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

    // Handle user registration
    socket.on("register-user", (userData: { userId: string; username: string }) => {
      // Remove any existing socket connections for this user
      const existingUserIndex = connectedUsers.findIndex(user => user.userId === userData.userId);
      if (existingUserIndex !== -1) {
        connectedUsers.splice(existingUserIndex, 1);
      }

      const newUser: ConnectedUser = {
        socketId: socket.id,
        userId: userData.userId,
        username: userData.username
      };
      
      connectedUsers.push(newUser);
      console.log("Connected Users:", connectedUsers);
      
      // Broadcast updated user list to all connected clients
      io.emit("users-updated", connectedUsers);
    });

    // Handle private messages
    socket.on("private-message", (messageData) => {
      console.log("Received private message:", messageData);
      const { receiverSocketId } = messageData;
      
      // Find the receiver's socket ID from connected users if not provided
      const receiver = connectedUsers.find(user => user.userId === messageData.receiverId);
      const targetSocketId = receiverSocketId || (receiver ? receiver.socketId : null);
      
      if (targetSocketId) {
        console.log("Sending to socket:", targetSocketId);
        // Emit the message to the specific receiver
        io.to(targetSocketId).emit("private-message", messageData);
      } else {
        console.log("Receiver not found:", messageData.receiverId);
      }
    });

    // Handle edited messages
    socket.on("message-edited", (editData: { messageId: string, content: string, receiverId: string, chatId: string }) => {
      console.log("Message edit received:", editData);
      
      // Find the receiver's socket ID from connected users
      const receiver = connectedUsers.find(user => user.userId === editData.receiverId);
      
      if (receiver) {
        console.log("Sending edited message to socket:", receiver.socketId);
        // Emit the edited message to the specific receiver
        io.to(receiver.socketId).emit("message-edited", {
          messageId: editData.messageId,
          content: editData.content,
          chatId: editData.chatId
        });
      } else {
        console.log("Receiver not found for edited message:", editData.receiverId);
      }
    });

    socket.on("disconnect", () => {
      // Remove user from connected users list
      const index = connectedUsers.findIndex(user => user.socketId === socket.id);
      if (index !== -1) {
        connectedUsers.splice(index, 1);
        console.log("Updated Connected Users:", connectedUsers);
        // Broadcast updated user list
        io.emit("users-updated", connectedUsers);
      }
      console.log("User Disconnected", socket.id);
    });
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
