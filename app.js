import express, { urlencoded } from 'express';
import cors from 'cors';
import bodyParser  from 'body-parser';
import mongoose from 'mongoose';
import customEnv from 'custom-env';
import routesChats from './routes/chats.js';
import routesTokens from'./routes/tokens.js';
import routesUsers from './routes/users.js';
import {Server} from "socket.io";
import http from "http";

import admin from 'firebase-admin';
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

const message = {
  notification: {
    title: "test title",
    body: "test body"
  },
  token : "d5am7TkOS6u2QB4nexSwXZ:APA91bHdYVDHK0wP9v1mvUZdbI10y1hR3qv9gWdLmjDLEAliMw9epoK-cgmx8ee0ywz0o_x7ghR5grO2zI1FAtr6cdyx7NY1XmX7iGhzEykye4jLS-iicku5Lougf-EoeDiqOcfBurP0"
}

admin.messaging().send(message)
.then((response) => {
// Response is a message ID string.
console.log('Successfully sent message:', response);
})
.catch((error) => {
console.log('Error sending message:', error);
});

// customEnv.env(process.env.NODE_ENV, './config')
//process.env.CONNECTION_STRING 
mongoose.connect("mongodb://localhost:27017/myDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4 //Dont know why but without it I get an error and it crashes //// - its ipv4
});

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors : {
    origin : "http://localhost:3000",
    method : ["GET", "POST", "DELETE"]
  }
});

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
app.use(cors());
// app.use(json());
app.use(bodyParser.urlencoded({extended: true}));
// app.set('view engine', 'ejs');

app.use('/api/Tokens', routesTokens);
app.use('/api/Chats', routesChats);
app.use('/api/Users', routesUsers);

io.on('connection', (socket) => {
  io.emit('hello', {foo: "bar"});
  socket.broadcast.emit("hello", {foo : "bar2"});
  socket.on("disconnect", () => {
    console.log("disconnected");
  });


  socket.on("sent_message", (CurrentUser) => {
    io.emit("message_render", {chat :CurrentUser});
  })
  socket.on("add_chat", (CurrentUser) => {
    io.emit("add_chat_render", {chat :CurrentUser});
  })
  socket.on("delete_chat", (CurrentUser) => {
    io.emit("delete_chat_render", {chat :CurrentUser});
  })

});

// app.listen(process.env.PORT);
app.listen(5000);
server.listen(3333);

// HERE ...

import { User } from './models/users.js';
import { Chat } from './models/chats.js';
import { Message } from './models/messages.js';
// import { futimes } from 'fs';

var highestIdUsers;
var highestIdChats;
var highestIdMsg;

(async() => {

    await Chat.findOne().sort('-chatId').then((chat) => {
    
    if (chat) {
      console.log('the highest ID of chat :', chat.chatId);
      highestIdChats = chat.chatId;
    } else {
      console.log('No chats found');
      highestIdChats = 0;
    }
  }).catch((err) => {
  });

  await User.findOne().sort('-userId').then((user) => {
    
    if (user) {
      console.log('the highest ID of user :', user.userId);
      highestIdUsers = user.userId;
    } else {
      console.log('No users found');
      highestIdUsers = 0;
    }
  }).catch((err) => {
  });

  await Message.findOne().sort('-MsgId').then((msg) => {
    
    if (msg) {
      console.log('the highest ID of Msg :', msg.MsgId);
      highestIdMsg = msg.MsgId;
    } else {
      console.log('No msg found');
      highestIdMsg = 0;
    }
  }).catch((err) => {
  });


})();

 function getHighestIdUsers(){
    return highestIdUsers;
 }

 function increaseHighestIdUsers(){
    highestIdUsers++;
 }

 function getHighestIdChats(){
    return highestIdChats;
 }
 
 function increaseHighestIdChats(){
    highestIdChats++;
 }

 function getHighestIdMsg(){
    return highestIdMsg;
 }
 
 function increaseHighestIdMsg(){
    highestIdMsg++;
 }

 export {
    admin,
    getHighestIdChats,
    getHighestIdMsg,
    getHighestIdUsers,
    increaseHighestIdChats,
    increaseHighestIdMsg,
    increaseHighestIdUsers
 }
 
