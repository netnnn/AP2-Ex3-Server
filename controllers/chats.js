import { androidUsersFirebaseTokens } from "../models/users.js";
import {
  getChatsByUserName,
  addChat,
  getAllChatDataByChatId,
  isMember,
  deleteChatById,
  readChat,
  addMsgByChatId,
  getAllMsgByChatId,
  getUser2
} from "../services/chats.js";

import jwt from "jsonwebtoken";
const key = "Never gonna give you up";

async function getAllChats(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, key);
    const username = data.username;
    // var chats_list = await getChatsByUserName(username);
    return res.status(200).send((await getChatsByUserName(username)).sort(((a, b) => {a.id - b.id})));
  } catch (error) {
    res.status(500).send("error occuered");
  }
}

async function addNewChat(req, res) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, key);
    const username = data.username;
    const friendUserName = req.body.username;

    if (username == null || friendUserName == null) {
      return res.status(400).send("Bad request");
    }

    if (username == friendUserName) {
      return res.status(400).send("Thou shalt not talk with thy self");
    }
    var answer = await addChat(username, friendUserName); //return json created chat if addition succeded, else return: ''.

    if (answer != null) {
      const firebaseToken = androidUsersFirebaseTokens.get(friendUserName);
      if (firebaseToken != undefined) {
        //push notification
      }
      return res.status(200).send(answer);
    }

    return res.status(409).send("no such user");
  } catch (error) {
    return res.status(500).send("error occuered");
  }
}

async function getChatDetails(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const data = jwt.verify(token, key);
  const username = data.username;
  const chatId = req.params.id;

  if (username == null || chatId == null) {
    return res.status(400).send("Bad request");
  }

  var answer_json = await getAllChatDataByChatId(username, chatId);
  if (answer_json == "") {
    return res.status(401).json({
      type: "https://tools.ietf.org/html/rfc7235#section-3.1",
      title: "Unauthorized",
      status: 401,
      traceId: "00-88c61470518dfaf201277e1fff706aab-a0b3b80cddabdb4a-00",
    });
  }
  return res.status(200).send(answer_json);
}

async function deleteChat(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const data = jwt.verify(token, key);
  const username = data.username;
  const chatId = req.params.id;

  if (username == null || chatId == null) {
    return res.status(400).send("Bad request");
  }

  if (!(await isMember(username, chatId))) {
    return res.status(401).json({
      type: "https://tools.ietf.org/html/rfc7235#section-3.1",
      title: "Unauthorized",
      status: 401,
      traceId: "00-88c61470518dfaf201277e1fff706aab-a0b3b80cddabdb4a-00",
    });
  }
  await deleteChatById(chatId);

  return res.status(200).send("chat deleted succesfully");
}

async function sendMessage(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const data = jwt.verify(token, key);
  const username = data.username;
  const chatId = req.params.id;
  const content = req.body.msg;

  if (content == null || chatId == null) {
    return res.status(400).send("Bad request");
  }

  if (!(await isMember(username, chatId))) {
    return res.status(401).json({
      type: "https://tools.ietf.org/html/rfc7235#section-3.1",
      title: "Unauthorized",
      status: 401,
      traceId: "00-88c61470518dfaf201277e1fff706aab-a0b3b80cddabdb4a-00",
    });
  }

  var answer_json = await addMsgByChatId(username, chatId, content);
  if (answer_json != null) {
    const firebaseToken = androidUsersFirebaseTokens.get(getUser2(chatId));
    if (firebaseToken != undefined) {
      //push notification
    }
    return res.status(200).send(answer_json);
  }
  return res.status(500).send("error occuered on sending msg");
}

async function getChatMesaages(req, res) {
  const token = req.headers.authorization.split(" ")[1];
  const data = jwt.verify(token, key);
  const username = data.username;
  const chatId = req.params.id;

  try {
    if (!(await isMember(username, chatId))) {
      return res.status(401).json({
        type: "https://tools.ietf.org/html/rfc7235#section-3.1",
        title: "Unauthorized",
        status: 401,
        traceId: "00-88c61470518dfaf201277e1fff706aab-a0b3b80cddabdb4a-00",
      });
    }

    var answer = await getAllMsgByChatId(username, chatId);

    return res.status(200).send(answer);
  } catch (error) {
    return res.status(401).json({
      type: "https://tools.ietf.org/html/rfc7235#section-3.1",
      title: "Unauthorized",
      status: 401,
      traceId: "00-88c61470518dfaf201277e1fff706aab-a0b3b80cddabdb4a-00",
    });
  }
}

export {
  getAllChats,
  addNewChat,
  getChatDetails,
  deleteChat,
  sendMessage,
  getChatMesaages,
};
