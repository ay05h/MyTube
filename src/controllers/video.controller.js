import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const matchStage = {
    isPublished: true,
  };

  if (query?.trim()) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId) {
    matchStage.owner = userId;
  }

  const sortStage = {};
  sortStage[sortBy] = sortType === "asc" ? 1 : -1;

  const aggregate = Video.aggregate([
    { $match: matchStage },
    { $sort: sortStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const videos = await Video.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

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

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || videoId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }

  const videoFile = await Video.findById(videoId).populate("owner", "username");

  if (!videoFile) {
    throw new ApiError(404, "Video don't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoFile, "Video File feteched successfully"));
});

const updateVideoDetailsById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }
  const { title, description } = req.body;
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description is required");
  }

  const updatedVideoFile = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },
    { $set: { title, description } },
    { new: true, runValidators: true }
  );

  if (!updatedVideoFile) {
    throw new ApiError(
      404,
      "Video do not exist or unauthorized to update this video"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideoFile,
        "Video details updated successfully"
      )
    );
});

const deleteVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || videoId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }

  const deletedVideoFile = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user?._id,
  });
  if (!deletedVideoFile) {
    throw new ApiError(404, "Video don't exist or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video File deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || videoId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }

  const updatedVideo = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user?._id },
    [
      {
        $set: {
          isPublished: { $not: "$isPublished" },
        },
      },
    ],
    { new: true }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video don't exist or unauthorized");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Published is toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDetailsById,
  deleteVideoById,
  togglePublishStatus,
};
