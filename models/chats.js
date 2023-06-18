import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    chatId:{
        type: Number,
        unique: true,  // Set the field as unique
        index: true,    // Create an index for efficient querying
        required: true
    },
    messagesList: {
        type: [Number],
        default: []
    },
    user1: {
        type: String,
        required: true
    },
    user2: {
        type: String,
        required: true
    }
});



const Chat = mongoose.model("Chat", ChatSchema);



export {
    Chat
  };
  