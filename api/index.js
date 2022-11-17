const express = require("express");
const usersRouter = require("./user");
const apiRouter = express.Router();

// api/users
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
