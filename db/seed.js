const { client, getAllUsers, createUser, updateUser } = require("./index");

const createInitialUsers = async () => {
  try {
    console.log("Starting to create ");

    await createUser({
      username: "albert",
      password: "bertie99",
      name: "Al Bert",
      location: "Sidney, Australia",
    });

    await createUser({
      username: "sandra",
      password: "2sandyme",
      name: "Just Sandra",
      location: "Ain't Tellin'",
    });

    await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Joshua",
      location: "Upper East Side",
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
};

const droptables = async () => {
  try {
    console.log("Starting to drop tables...");
    // We drop posts first because has a foreign key to users
    // If we drop users first we get a constraint error b/c posts foreign key depends on users primary key
    // user can have many posts
    await client.query(`
      DROP TABLE IF EXISTS posts;
    `);

    await client.query(`
        DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
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
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
    `);

    await client.query(`
        CREATE TABLE posts(
          id SERIAL PRIMARY KEY,
          "authorId" INTEGER REFERENCES users(id) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          active BOOLEAN DEFAULT true
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

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);
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
