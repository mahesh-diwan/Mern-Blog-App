import Post from "../models/post.model.mjs";
import { errorHandler } from "../utils/error.mjs";

export const createBlog = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(
      errorHandler(403, "You do not have permission to create a blog.")
    );
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(403, "Please provide all required fields"));
  }
  
  const slug = req.body.title
    .toLowerCase()
    .split(/\s+/)
    .join("-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .replace(/-+/g, "-") // Replace consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove hyphens from beginning and end

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(errorHandler());
  }
};
