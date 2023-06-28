import mongoose from "mongoose";
import { createUser, readUserByName } from "../services/users.js";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId:{
        type: Number,
        unique: true,  // Set the field as unique
        index: true,    // Create an index for efficient querying
        required: true
    },
    profilePic: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,  // Set the field as unique
        index: true    // Create an index for efficient querying
    },
    chatsList: {
        type: [Number],
    },
});

const User = mongoose.model('User', UserSchema);

const androidUsersFirebaseTokens = new Map();

export {
    User,
    androidUsersFirebaseTokens
}