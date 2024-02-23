import Comment from "../models/comment.model.mjs";
import { errorHandler } from "../utils/error.mjs";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;
    if (userId !== req.user.id) {
      return next(
        errorHandler(
          403,
          "You are not allowed to create a comment for this user"
        )
      );
    } else if (userId === req.user.id) {
      const newComment = new Comment({
        content,
        postId,
        userId,
      });
      await newComment.save();
      res.status(200).json(newComment);
    }
  } catch (error) {
    next(error);
  }
};
