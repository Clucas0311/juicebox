require("dotenv").config();

const express = require("express");
const server = express();

// MIDDLEWARE --> This runs in between the req and resp
// .use allows this to run always when this function is called
// A user/client request sends an object to our server
// What this function will do is log out three lines and the request body

/*
 * @todo
 */

// Logging MIDDLEWARE
const volleyball = require("volleyball");
server.use(volleyball);
// Middleware to read incoming JSON
server.use(express.json());
// Router MIDDLEWARE
const apiRouter = require("./api");
server.use("/api", apiRouter);

server.use((req, res, next) => {
  console.log("<---Body Logger START--->");
  console.log(req.body);
  console.log("<---Body Logger END---->");

  next();
});

// When retrieving things from the database you need to conenct to your client before starting the server
const { client } = require("./db");
client.connect();

const PORT = 3000;
server.listen(PORT, () => console.log("The server is up on port", PORT));
