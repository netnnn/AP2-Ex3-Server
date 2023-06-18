import { User } from "../models/users.js";
import { getHighestIdUsers, increaseHighestIdUsers } from "../app.js";
import { isMember } from "./chats.js";

const addUser = async (profilePic, displayName, password, username) => {
  const doesExistAlready = await readUserByName(username);
  if (doesExistAlready) return null;

  var userID = getHighestIdUsers() + 1;
  increaseHighestIdUsers();

  return await createUser(userID, profilePic, displayName, password, username);
};

const createUser = async (
  userID,
  profilePic,
  displayName,
  password,
  username
) => {
  const user = new User({
    userId: userID,
    profilePic,
    displayName,
    password,
    username,
  });
  return await user.save();
};

const readUserByName = async (username) => {
  return await User.findOne({ username });
};

const getChatsListOfUserByUsername = async (username) => {
  const user = await readUserByName(username);

  if (!user) return null;
  return user.chatsList;
};

const getProfilePicOfUserByUsername = async (username) => {
  const user = await readUserByName(username);
  if (!user) return null;
  return user.profilePic;
};

const getDisplasyNameUserByUsername = async (username) => {
  const user = await readUserByName(username);
  if (!user) return null;
  return user.displayName;
};

const updateChatsListOfUserByName = async (username, chatsList) => {
  const user = await readUserByName(username);
  if (!user) return null;
  user.chatsList = chatsList;
  return await user.save();
};

const isFriends = async (username, friendUserName) => {
  var x = await readUserByName(username);
  if (x.chatsList == null) {
    return false;
  }
  var yes = false;
  
  await Promise.all(x.chatsList.map(async (chatID) => {
    var bool = await isMember(friendUserName, chatID);
    if (bool) {
      yes = true;
    }
  }));
  if (yes) {
    return true;  
  }
  return false;
};

export {
  createUser,
  readUserByName,
  updateChatsListOfUserByName,
  // deleteUserByName,
  getChatsListOfUserByUsername,
  getProfilePicOfUserByUsername,
  getDisplasyNameUserByUsername,
  addUser,
  isFriends,
};
