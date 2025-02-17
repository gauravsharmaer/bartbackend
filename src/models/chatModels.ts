import mongoose, { Schema} from "mongoose";
import {  IChat } from "../types/userTypes";

// Schema for individual messages
const messageSchema = new Schema({
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

// Main chat schema
const chatSchema = new Schema(
  {
    participants: {
      type: [String],
      required: true,
      validate: {
        validator: function(arr: string[]) {
          return arr.length === 2;
        },
        message: "Chat must have exactly 2 participants",
      },
    },
    messages: [messageSchema],
    lastMessage: {
      type: messageSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ "messages.timestamp": 1 });
chatSchema.index({ updatedAt: -1 });

export default mongoose.model<IChat>("RealTimeChat", chatSchema);
