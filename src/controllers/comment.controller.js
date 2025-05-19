import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
const getCommentsOnVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || videoId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }

  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required for comment");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  await comment.populate("owner", "username").populate("video", "title");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added succesfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || commentId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }

  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required for comment");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: req.user?._id },
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(
      404,
      "Comment do not exist or unauthorized to update this comment"
    );
  }

  await comment.populate("owner", "username").populate("video", "title");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || commentId.trim() === "") {
    throw new ApiError(400, "Video id is missing");
  }

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(
      404,
      "Comment do not exist or unauthorized to delete this comment"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getCommentsOnVideo, addComment, updateComment, deleteComment };
