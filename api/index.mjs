import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.mjs";
import authRoutes from "./routes/auth.route.mjs";
import postRoutes from './routes/post.route.mjs'
import commentRoutes from './routes/comment.route.mjs'
import cookieParser from "cookie-parser";
import path from 'path';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    //process.env.MONGO is the mongodb link to the database
    console.log("MongoDB Database Connected");
  })
  .catch((error) => {
    console.log("MongoDB Database Connection Error", error);
  });

const app = express();
app.use(express.json());
app.use(cookieParser());
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

const __dirname = path.resolve();

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

//Middleware for error messages
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
