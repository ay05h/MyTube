import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel ID is missing or invalid");
  }

  const existingSubscription = await Subscription.findOneAndDelete({
    subscriber: req.user?._id,
    channel: channelId,
  });

  if (existingSubscription) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Channel unsubscribed successfully"));
  }

  const newSubscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!newSubscription) {
    throw new ApiError(
      500,
      "Something went wrong while subscribing to the channel"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, newSubscription, "Channel subscribed successfully")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel ID is missing or invalid");
  }

  if (String(req.user?._id) !== channelId) {
    throw new ApiError(403, "Unauthorized request for subscribers");
  }

  const subscriberList = await Subscription.find({
    channel: channelId,
  }).populate({
    path: "subscriber",
    select: "username avatar",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriberList,
        "Subscribers list fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Subscriber ID is missing or invalid");
  }

  if (String(req.user?._id) !== subscriberId) {
    throw new ApiError(403, "Unauthorized request for subscribed channels");
  }

  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  }).populate({
    path: "channel",
    select: "username avatar",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "User subscriptions list fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
