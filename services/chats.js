import { Chat } from "../models/chats.js";
import {
  getChatsListOfUserByUsername,
  getProfilePicOfUserByUsername,
  getDisplasyNameUserByUsername,
  readUserByName,
  updateChatsListOfUserByName,
} from "../services/users.js";
import { readMessage, deleteMessage } from "../services/messages.js";
import {
  getHighestIdChats,
  increaseHighestIdChats,
  getHighestIdMsg,
  increaseHighestIdMsg,
} from "../app.js";
import { Message } from "../models/messages.js";
import { validatorErrorSymbol } from "mongoose/lib/helpers/symbols.js";

const createChat = async (user1, user2) => {
  var chatId = getHighestIdChats() + 1;
  increaseHighestIdChats();

  const chat = new Chat({ chatId: chatId, user1, user2 });
  chat.messagesList = [];

  return await chat.save();
};

const readChat = async (chatId) => {
  return await Chat.findOne({ chatId });
};

const getUser1 = async (id) => {
  const chat = await readChat(id);
  if (!chat) return null;
  return chat.user1;
};

const getUser2 = async (id) => {
  const chat = await readChat(id);
  if (!chat) return null;
  return chat.user2;
};

const getMessagesList = async (id) => {
  const chat = await readChat(id);
  if (!chat) return null;
  return chat.messagesList;
};

const updateMessagesListOfChat = async (id, messagesList) => {
  const chat = await readChat(id);
  if (chat == null) return null;
  chat.messagesList = messagesList;
  return await chat.save();
};

const deleteChatById = async (id) => {
  const chat = await readChat(id);
  if (chat == null) return null;

  var user_one_name = await getUser1(id);
  var user_one = await readUserByName(user_one_name);

  var list = user_one.chatsList;
  var newList = [];
  await Promise.all(list.map(async (chatId) => {
    if(chatId != id){
      await newList.push(chatId);
    }
  }));

  user_one.chatsList = newList;
  await user_one.save();

  var user_two_name = await getUser2(id);
  var user_two = await readUserByName(user_two_name);
  user_two.chatsList = user_two.chatsList.filter((item) => {
    item !== id;
  });
  await user_two.save();

  var msgList = chat.messagesList;
  msgList.forEach(async (msg) => {
    deleteMessage(msg);
  });

  return await chat.deleteOne();
};

//CRUD

// FROM MODEL

const getChatsByUserName = async (username) => {
  var response = [];
  var chatsIdList = await getChatsListOfUserByUsername(username);

  if (chatsIdList == null) {
    return response;
  }
  await Promise.all(chatsIdList.map(async (element) => {
    var user_one = await getUser1(element);
    var user_two = await getUser2(element);
    var chat_json = { id: 0, user: {}, lastMessage: {} };
    chat_json.id = element;
    chat_json.user =
      user_one == username
        ? await getUserDetailsByUsername(user_two)
        : await getUserDetailsByUsername(user_one);
    chat_json.lastMessage = await getLastMsgByChatId(element);

    response.push(chat_json);
    await response.sort((a, b) => {a.id - b.id});
  }));

  // that is the format of each chat_json
  // {
  //  "id": 1,
  //  "user":     {
  //     "username": "name",
  //     "displayName": "coolguy123",
  //     "profilePic": "sdlfkhszdicvha8o9vhjv9821y49238w5po23iu4589udfnc89q3h..."
  // },
  //  "lastMessage": {
  //      "id": 1,
  //      "created": "2023-06-01T16:38:46.0270481",
  //      "content": "hello"
  //    }
  // }

  response.sort((a, b) => {a.id - b.id});
  return response;
};

const getLastMsgByChatId = async (chatId) => {
  var chat = await readChat(chatId);

  if (chat == null){
    return null;
  }

  var messagesList = chat.messagesList;
  if (messagesList == null) {
    return null;
  }

  if(messagesList.length == 0) {
    return null;
  }

  var last_msg = await readMessage(messagesList[0]);

  var msg_json = { id: "", created: "", content: "" };
  msg_json.id = messagesList[messagesList.length - 1];
  msg_json.created = last_msg.created;
  msg_json.content = last_msg.content;

  return msg_json;

  //get message json (the last table in the pdf) of the chat Id. looks like this
  // {
  //   "id": 1,
  //   "created": "2023-06-01T16:38:46.0270481",
  //   "content": "hello"
  // }
};

const getUserDetailsByUsername = async (username) => {
  var userDetails_json = { username: "", displayName: "", profilePic: "" };
  userDetails_json.username = username;
  userDetails_json.displayName = await getDisplasyNameUserByUsername(username);
  userDetails_json.profilePic = await getProfilePicOfUserByUsername(username);
  return userDetails_json;

  //get user details: username, profile and displayName (no password) of a user, looks like this
  // {
  //     "username": "name",
  //     "displayName": "coolguy123",
  //     "profilePic": "sdlfkhszdicvha8o9vhjv9821y49238w5po23iu4589udfnc89q3h..."
  // }
};

const addChat = async (username, friendUserName) => {
  var x = await readUserByName(friendUserName);
  if (x == null) {
    return null;
  }
  var chat = await createChat(username, friendUserName);
  var chatsList1 = await getChatsListOfUserByUsername(username);
  chatsList1.push(chat.chatId);
  await updateChatsListOfUserByName(username, chatsList1);
  var chatsList2 = await getChatsListOfUserByUsername(friendUserName);
  chatsList2.push(chat.chatId);
  await updateChatsListOfUserByName(friendUserName, chatsList2);

  var response_json = { id: "", user: {} };
  response_json.id = chat.chatId;
  response_json.user = await getUserDetailsByUsername(friendUserName);
  return response_json;

  //add the chat to the chat table and add the chat to the chatlist of each user.

  //return json like this:
  //{
  //  "id": 13,
  //  "user": {
  //    "username": "bb",
  //    "displayName": "bb",
  //    "profilePic": "sdkfjsdkvnsd79f23h78q9w3hf9whfosifh938shvlhvjw8..."
  //  }
  //}
};

const getMessageDetailsById = async (id) => {
  var sender = await readMessage(id).sender;
  var answer_json = { id: "", created: "", sender: {}, content: "" };

  answer_json.id = id;
  answer_json.created = await readMessage(id).created;
  answer_json.sender = await getUserDetailsByUsername(sender);
  answer_json.content = await readMessage(id).content;

  return answer_json;

  //   {
  //     "id": 1,
  //     "created": "2023-06-01T16:38:46.0270481",
  //     "sender": {
  //       "username": "aa",
  //       "displayName": "aa",
  //       "profilePic": "sdkfjsdkvnsd79f23h78q9w3hf9whfosifh938shvlhvjw8..."
  //          },
  //      "content": "aaaaa"
  //   }
};

const isMember = async (username, chatId) => {
  var chatsIdList = await getChatsListOfUserByUsername(username);
  var d = await chatsIdList.includes(chatId);
  return d; // if the user asks for a chat he is not a member of - return false.
};

const getAllChatDataByChatId = async (username, chatId) => {
  if (!(await isMember(username, chatId))) {
    // if the user asks for a chat he is not a member of - return "".
    return "";
  }
  var messageIdList = await getMessagesList(chatId);
  var user_one = await getUser1(chatId);
  var user_two = await getUser2(chatId);

  var chat_json = { id: "", users: [], messages: [] };

  chat_json.id = chatId;

  chat_json.users.push(await getUserDetailsByUsername(user_one));
  chat_json.users.push(await getUserDetailsByUsername(user_two));

  messageIdList.forEach(async (element) => {
    chat_json.messages.push(await getMessageDetailsById(element));
  });

  return chat_json;

  //{
  // "id": 3,
  // "users": [
  //   {
  //     "username": "aa",
  //     "displayName": "aa",
  //     "profilePic": "sdkfjsdkvnsd79f23h78q9w3hf9whfosifh938shvlhvjw8..."
  // },
  // {
  //   "username": "bb",
  //   "displayName": "bb",
  //   "profilePic": "sdkfjsdkvnsd79f23h78q9w3hf9whfosifh938shvlhvjw8..."
  // }
  // ],
  // "messages":
  // [
  //   {
  //     "id": 1,
  //     "created": "2023-06-01T16:38:46.0270481",
  //     "sender": {
  //       "username": "aa",
  //       "displayName": "aa",
  //       "profilePic": "sdkfjsdkvnsd79f23h78q9w3hf9whfosifh938shvlhvjw8..."
  //      },
  // "content": "aaaaa"
  //   }
  //  ]
  // }
};

const addMsgByChatId = async (username, chatId, content) => {
  var msgId = getHighestIdMsg() + 1;
  increaseHighestIdMsg();
  var sender_Json = await getUserDetailsByUsername(username);

  try {
    const message = new Message({ MsgId: msgId, content, sender: sender_Json });
    await message.save();

    var chat = await readChat(chatId);
    var msgList = chat.messagesList;
    msgList.unshift(msgId);
    chat.messagesList = msgList;
    await chat.save();

    var msg_Json = {
      id: msgId,
      created: message.created,
      sender: sender_Json,
      content: content,
    };
    return msg_Json;
  } catch (error) {
    return null;
  }
};

const getAllMsgByChatId = async (username, chatId) => {
  var answer = [];
  var chat = await readChat(chatId);
  var msgList = chat.messagesList;
  var msgJson;


  await Promise.all(msgList.map(async (msg) => {
      var message = await readMessage(msg);

      msgJson = {
        id: msg,
        created: message.created,
        sender: { username: message.sender.username },
        content: message.content,
      };
      answer.push(msgJson);
      answer.sort((a, b) => {b.id - a.id});
    }))
      return answer;
  };

 

  // [
  //   {
  //     "id": 1,
  //     "created": "2023-06-01T16:38:46.0270481",
  //     "sender": {
  //       "username": "aa"
  //     },
  //     "content": "aaaaa"
  //   }
  // ]


export {
  createChat,
  readChat,
  updateMessagesListOfChat,
  deleteChatById,
  getUser1,
  getUser2,
  getMessagesList,
  getChatsByUserName,
  getUserDetailsByUsername,
  addChat,
  getAllChatDataByChatId,
  isMember,
  addMsgByChatId,
  getAllMsgByChatId,
};
