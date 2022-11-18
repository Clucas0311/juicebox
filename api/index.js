const express = require("express");

const apiRouter = express.Router();

// api/users
const usersRouter = require("./user");
apiRouter.use("/users", usersRouter);

// api/posts
const postsRouter = require("./posts");
apiRouter.use("/posts", postsRouter);

// api/tags
const tagsRouter = require("./tags");
apiRouter.use("/tags", tagsRouter);

module.exports = apiRouter;
