import  express  from "express";
import { register, getUserDetails } from "../controllers/users.js";
import { isLoggedIn } from "../controllers/tokens.js";

const router = express.Router();

router.get('/:username', isLoggedIn, getUserDetails);
router.post('/', register);

export default router;