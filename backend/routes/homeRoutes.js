import homeController from "../controllers/homeController.js"
import {Router} from "express";

const router = Router();

router.get("/", homeController )

export default router