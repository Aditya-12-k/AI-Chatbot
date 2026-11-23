import express from "express"
import { registerUser,loginUser,getMe,logoutUser ,verifyEmail} from "../controllers/auth.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js"
const router = express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/get-me",authMiddleware,getMe);
router.post("/logout",logoutUser)
router.get("/verify-email",verifyEmail);
export default router