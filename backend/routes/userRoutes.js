import { Router } from "express";
import { getMessageContacts, getMessageUsers } from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/message-contacts", verifyToken, getMessageContacts);
router.get("/message-users", verifyToken, getMessageUsers);

export default router;
