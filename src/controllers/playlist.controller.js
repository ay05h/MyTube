import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) && id.trim() !== "";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(500, "Something went wrong while creating the playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid or missing User ID");
  }

  if (String(req.user?._id) !== userId) {
    throw new ApiError(401, "Unauthorized request for playlists");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid or missing Playlist ID");
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: req.user?._id,
  }).populate({
    path: "videos",
    select: "title thumbnail views duration owner",
    populate: {
      path: "owner",
      select: "username",
    },
  });

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist does not exist or you're not authorized to view it"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Playlist details fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid or missing Playlist ID");
  }

  if (isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid or missing Video ID");
  }

  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user?._id },
    { $addToSet: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist does not exist or you're not authorized to add video"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid or missing Playlist ID");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid or missing Video ID");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user?._id },
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist does not exist or you're not authorized to remove video"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid or missing Playlist ID");
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist does not exist or you're not authorized to delete it"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  let { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid or missing Playlist ID");
  }

  name = name?.trim();
  description = description?.trim();

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user?._id },
    { $set: { name, description } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist does not exist or you're not authorized to update it"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
