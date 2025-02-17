import { Request, Response } from "express";
import Chat from "../models/chatModels";

export const saveMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Validate input
    if (!senderId || !receiverId || !content) {
      res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
      return;
    }

    // Sort participants to ensure consistent ordering
    const participants = [senderId, receiverId].sort();

    // Find existing chat or create new one
    let chat = await Chat.findOne({ participants });

    const newMessage = {
      sender: senderId,
      content,
      timestamp: new Date(),
      read: false,
    };

    if (!chat) {
      // Create new chat if it doesn't exist
      chat = new Chat({
        participants,
        messages: [newMessage],
        lastMessage: newMessage,
      });
    } else {
      // Add message to existing chat
      chat.messages.push(newMessage);
      chat.lastMessage = newMessage;
    }

    await chat.save();

    res.status(201).json({
      status: "success",
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error saving message",
      error,
    });
  }
};

export const getChatHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId1, userId2 } = req.params;
    const { page = 1, limit = 50 } = req.query; // Pagination parameters

    if (!userId1 || !userId2) {
      res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
      return;
    }

    // Sort participants to ensure consistent ordering
    const participants = [userId1, userId2].sort();

    const chat = await Chat.findOne({ participants })
      .select({
        messages: { 
          $slice: [(Number(page) - 1) * Number(limit), Number(limit)] 
        },
        participants: 1,
        lastMessage: 1,
      });

    res.status(200).json({
      status: "success",
      data: chat || { participants, messages: [], lastMessage: null },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching chat history",
      error,
    });
  }
};

export const markMessagesAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404).json({
        status: "error",
        message: "Chat not found",
      });
      return;
    }

    // Mark all unread messages from the other user as read
    const updated = await Chat.updateMany(
      {
        _id: chatId,
        "messages.sender": { $ne: userId },
        "messages.read": false,
      },
      {
        $set: {
          "messages.$[elem].read": true,
        },
      },
      {
        arrayFilters: [{ "elem.read": false }],
      }
    );

    res.status(200).json({
      status: "success",
      data: { modifiedCount: updated.modifiedCount },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error marking messages as read",
      error,
    });
  }
};

export const getRecentChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const recentChats = await Chat.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .select({
        participants: 1,
        lastMessage: 1,
        updatedAt: 1,
      });

    res.status(200).json({
      status: "success",
      data: recentChats,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching recent chats",
      error,
    });
  }
};

export const deleteChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId1, userId2 } = req.params;

    if (!userId1 || !userId2) {
      res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
      return;
    }

    // Sort participants to ensure consistent ordering
    const participants = [userId1, userId2].sort();

    // Find and delete the chat
    const result = await Chat.findOneAndDelete({ participants });

    if (!result) {
      res.status(404).json({
        status: "error",
        message: "Chat not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Chat deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting chat",
      error,
    });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId, messageId } = req.params;

    if (!chatId || !messageId) {
      res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
      return;
    }

    // Find the chat and remove the specific message
    const result = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { messages: { _id: messageId } }
      },
      { new: true }
    );

    if (!result) {
      res.status(404).json({
        status: "error",
        message: "Chat or message not found",
      });
      return;
    }

    // Update lastMessage if the deleted message was the last one
    if (result.messages.length > 0) {
      result.lastMessage = result.messages[result.messages.length - 1];
      await result.save();
    }

    res.status(200).json({
      status: "success",
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting message",
      error,
    });
  }
};

export const editMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId, messageId } = req.params;
    const { content } = req.body;

    if (!chatId || !messageId || !content) {
      res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
      return;
    }

    // Find and update the specific message
    const result = await Chat.findOneAndUpdate(
      { 
        _id: chatId,
        "messages._id": messageId 
      },
      { 
        $set: { 
          "messages.$.content": content,
          "messages.$.edited": true
        } 
      },
      { new: true }
    );

    if (!result) {
      res.status(404).json({
        status: "error",
        message: "Chat or message not found",
      });
      return;
    }

    // If this was the last message, update lastMessage
    
    const updatedMessage = result.messages.find(msg => msg._id?.toString() === messageId);
    if (result?.lastMessage?._id?.toString() === messageId) {
      if (updatedMessage) {
        result.lastMessage = updatedMessage;
        await result.save();
      }
    }

    res.status(200).json({
      status: "success",
      data: updatedMessage,
      message: "Message updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating message",
      error,
    });
  }
};
