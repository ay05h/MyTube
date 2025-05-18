import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description is required");
  }

  const thumbnailLocalPath =
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
      ? req.files.thumbnail[0].path
      : undefined;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoLocalPath =
    req.files && Array.isArray(req.files.video) && req.files.video.length > 0
      ? req.files.video[0].path
      : undefined;

  if (!videoLocalPath) {
    throw new ApiError(400, "video is required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const videoFile = await uploadOnCloudinary(videoLocalPath);

  if (!thumbnail || !thumbnail.url) {
    throw new ApiError(500, "Something went wrong while uploading thumbnail");
  }

  if (!videoFile || !videoFile.url) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
    views: 0,
    isPublished: true,
    owner: req.user._id,
  });

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while registering video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully."));
});

export { publishAVideo };
