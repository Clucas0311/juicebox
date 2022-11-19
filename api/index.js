const express = require("express");

const apiRouter = express.Router();

const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");
const { JWT_SECRET } = process.env;

// set `req.user` if possible
apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    // nothing to see here - if user is logged in
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      // verify them
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        // get their id
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

// MIDDLEWARE To Test User
apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});
// api/users
const usersRouter = require("./user");
apiRouter.use("/users", usersRouter);

// api/posts
const postsRouter = require("./posts");
apiRouter.use("/posts", postsRouter);

// api/tags
const tagsRouter = require("./tags");
apiRouter.use("/tags", tagsRouter);

// Error handling middleware
apiRouter.use((error, req, res, next) => {
  res.status(500).send({
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
