import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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

  if (!userId || userId.trim() === "") {
    throw new ApiError(400, "User ID is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID format");
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

  if (!playlistId || playlistId.trim() === "") {
    throw new ApiError(400, "Playlist ID is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID format");
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

  if (!playlistId || playlistId.trim() === "") {
    throw new ApiError(400, "Playlist ID is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID format");
  }

  if (!videoId || videoId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
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
