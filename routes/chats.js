import  express  from "express";
import { addNewChat, deleteChat, getAllChats, sendMessage, getChatDetails, getChatMesaages } from "../controllers/chats.js";
import { isLoggedIn } from "../controllers/tokens.js";


const router = express.Router();

router.get('/', isLoggedIn, getAllChats);
router.post('/', isLoggedIn, addNewChat);
router.get('/:id', isLoggedIn, getChatDetails);
router.delete('/:id', isLoggedIn, deleteChat);
router.post('/:id/Messages', isLoggedIn, sendMessage);
router.get('/:id/Messages', isLoggedIn, getChatMesaages);

export default router;