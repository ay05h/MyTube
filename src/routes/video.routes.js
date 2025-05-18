import { Router } from "express";
import {
  deleteVideoById,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideoDetailsById,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.use(verifyJWT);

router.route("/").get(getAllVideos);

router.route("/publish-video").post(
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router
  .route("/:videoId")
  .get(getVideoById)
  .patch(updateVideoDetailsById)
  .delete(deleteVideoById);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
export default router;
