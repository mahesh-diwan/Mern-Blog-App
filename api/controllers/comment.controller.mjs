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

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({createdAt: -1});
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};


export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if(!comment){
      return next(errorHandler(404, 'Comment not found'));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if(userIndex === -1){
      comment.numberOfLikes++;
      comment.likes.push(req.user.id);
    }else{
      comment.numberOfLikes--;
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
  }
}

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if(!comment) {
      next(errorHandler(404, 'Comment not found'));
    }

    if(comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(errorHandler(403, 'You do not have permission to edit this comment'))
    }

    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content
      },
      {new: true}
    )
    res.status(200).json(editedComment);
  } catch (error) {
    console.log(error);
  }
}