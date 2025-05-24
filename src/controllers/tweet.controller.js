import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  let { content } = req.body;
  content = String(content).trim();

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (content.length > 280) {
    throw new ApiError(400, "Tweet content must be 280 characters or less");
  }

  const tweet = await Tweet.create({ content, owner: req.user?._id });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userTweets = await Tweet.find({ owner: req.user?._id }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid or missing Tweet ID");
  }

  let { content } = req.body;

  content = String(content).trim();

  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  if (content.length > 280) {
    throw new ApiError(400, "Tweet content must be 280 characters or less");
  }

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user?._id },
    { $set: { content } },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(
      404,
      "Tweet does not exist or you're not authorized to update it"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid or missing Tweet ID");
  }

  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(
      404,
      "Tweet does not exist or you're not authorized to delete it"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted  successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
