import  express  from "express";
import { getToken } from "../controllers/tokens.js";
const router = express.Router();

router.post('/', getToken);

export default router;