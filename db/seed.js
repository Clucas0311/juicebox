const { client, getAllUsers, createUser } = require("./index");

const createInitialUsers = async () => {
  try {
    console.log("Starting to create ");

    const albert = await createUser({
      username: "albert",
      password: "bertie99",
    });
    console.log("albert:", albert);

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
};

const droptables = async () => {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS users;
    `);

    console.log("Finshed dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
};

const createTables = async () => {
  try {
    console.log("Starting to build tables...");

    await client.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
    `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
};

const rebuildDB = async () => {
  try {
    client.connect();

    await droptables();
    await createTables();
    await createInitialUsers();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const testDB = async () => {
  try {
    console.log("Starting to test database...");

    const users = await getAllUsers();
    console.log("getAllUsers:", users);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!", error);
    throw error;
  }
};

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
