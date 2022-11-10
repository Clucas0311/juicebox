const { client, getAllUsers } = require("./index");

const testDB = async () => {
  try {
    // connect the client to the database
    client.connect();

    // const { rows } = await client.query(`SELECT * FROM users;`);
    const users = await getAllUsers();
    console.log("users", users);
  } catch (error) {
    console.error(error);
  } finally {
    // ends client connection
    client.end();
  }
};

testDB();
