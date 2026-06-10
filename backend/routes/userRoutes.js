import { Router } from "express";
import { getMessageContacts, getMessageUsers, searchCitizens } from "../controllers/userController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/message-contacts", verifyToken, getMessageContacts);
router.get("/message-users", verifyToken, getMessageUsers);
router.get("/citizens/search", verifyToken, searchCitizens);

export default router;
