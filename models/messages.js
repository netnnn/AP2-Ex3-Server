import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageModel = new Schema({
  MsgId: {
    type: Number,
    unique: true, // Set the field as unique
    index: true, // Create an index for efficient querying
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: JSON,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", MessageModel);

export { Message };
