const express = require("express");
const server = express();

const PORT = 3000;
server.listen(PORT, () => console.log("The server is up on port", PORT));
