import {Message} from "../models/messages.js";
import { getHighestIdMsg, increaseHighestIdMsg } from "../app.js";

const createMessage = async (content, sender, created) => {
    var msgId = getHighestIdMsg()+1;
    increaseHighestIdMsg();

    const message = new Message({"msgId":msgId ,content, sender});
    if (created) message.created = created;
    return await message.save();
}

const readMessage = async (MsgId) => {
    return await Message.findOne({MsgId});
}

const updateContentOfMessage = async (id, content) => {
    const message = await readMessage(id);
    if (!message) return null;
    message.content = content;
    return await message.save();
}

const deleteMessage = async (id) => {
    const message = await readMessage(id);
    if (!message) return null;
    return await message.deleteOne();
}

//CRUD

export {
    createMessage,
    readMessage,
    updateContentOfMessage,
    deleteMessage
};