import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getCommentsOnVideo,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").get(getCommentsOnVideo).post(addComment);

router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
