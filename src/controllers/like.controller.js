import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video ID is missing or Invalid");
  }
  const existingLike = await Like.findOneAndDelete({
    video: videoId,
    likeBy: req.user?._id,
  });

  if (existingLike) {
    const videoLikeCount = await Like.countDocuments({ video: videoId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false, videoLikeCount },
          "Video like removed successfully"
        )
      );
  }

  await Like.create({
    video: videoId,
    likeBy: req.user?._id,
  });
  const videoLikeCount = await Like.countDocuments({ video: videoId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked: true, videoLikeCount: videoLikeCount },
        "Video liked successfully"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Comment ID is missing or Invalid");
  }

  const existingLike = await Like.findOneAndDelete({
    comment: commentId,
    likeBy: req.user?._id,
  });

  if (existingLike) {
    const commentLikeCount = await Like.countDocuments({ comment: commentId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false, commentLikeCount },
          "Comment like removed successfully"
        )
      );
  }

  await Like.create({
    comment: commentId,
    likeBy: req.user?._id,
  });

  const commentLikeCount = await Like.countDocuments({ comment: commentId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked: true, commentLikeCount },
        "Comment liked successfully"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet ID is missing or Invalid");
  }

  const existingLike = await Like.findOneAndDelete({
    tweet: tweetId,
    likeBy: req.user?._id,
  });

  if (existingLike) {
    const tweetLikeCount = await Like.countDocuments({ tweet: tweetId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false, tweetLikeCount },
          "Tweet like removed successfully"
        )
      );
  }

  await Like.create({
    tweet: tweetId,
    likeBy: req.user?._id,
  });

  const tweetLikeCount = await Like.countDocuments({ tweet: tweetId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked: true, tweetLikeCount },
        "Tweet liked successfully"
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likeBy: req.user._id,
    video: { $exists: true, $ne: null },
  }).populate({
    path: "video",
    select: "title thumbnail views duration owner",
    populate: {
      path: "owner",
      select: "username",
    },
  });

  const videosOnly = likedVideos
    .filter((like) => like.video !== null)
    .map((like) => like.video);

  return res
    .status(200)
    .json(
      new ApiResponse(200, videosOnly, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
