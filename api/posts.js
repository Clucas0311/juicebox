const express = require("express");
const postsRouter = express.Router();
const { getAllPosts } = require("../db");

postsRouter.use((req, res, next) => {
  console.log("A request is being made to the posts route");
  next();
});

postsRouter.get("/", async (req, res, next) => {
  const posts = await getAllPosts();
  res.status(200).send({ posts });
});

module.exports = postsRouter;
