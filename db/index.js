const { Client } = require("pg"); // imports the pg module so we can use pg

// runs our server on port 5432
const client = new Client("postgres://localhost:5432/juicebox-dev");

const getAllUsers = async () => {
  try {
    const { rows } = await client.query(`
          SELECT id, username, name, location, active
          FROM users;
      `);
    return rows;
  } catch (error) {
    console.log("There was an error getting all the users");
    throw error;
  }
};

const getAllPosts = async () => {
  try {
    const { rows } = await client.query(`
      SELECT * 
      FROM posts;
    `);

    return rows;
  } catch (error) {
    console.log("There was an error getting all posts!");
    throw error;
  }
};

const getPostsByUser = async (userId) => {
  try {
    const { rows } = await client.query(
      `
      SELECT * 
      FROM posts
      WHERE "authorId" = $1;
    `,
      [userId]
    );

    return rows;
  } catch (error) {
    console.log("There was an error getting posts from user");
  }
};

const getUserById = async (userId) => {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT * FROM users
      WHERE id = $1
    `,
      [userId]
    );
    if (!user) return null;

    user.posts = await getPostsByUser(userId);
    return user;
  } catch (error) {
    console.log("There was an error getting user by id");
    throw error;
  }
};

const createUser = async ({ username, password, name, location }) => {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
            INSERT INTO users(username, password, name, location) 
            VALUES($1, $2, $3, $4)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `,
      [username, password, name, location]
    );
    return user;
  } catch (error) {
    console.log("There was an error, creating user");
    throw error;
  }
};

const createPost = async ({ authorId, title, content }) => {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      INSERT INTO posts("authorId", title, content)
      VALUES ($1, $2, $3)
    `,
      [authorId, title, content]
    );
    return post;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (userId, fields = {}) => {
  // This is taking the field keys and storing them to a value $1 each
  // Storing each key to the placeholder to prevent SQL Injection
  // "username"= $1 password = $2

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 2}`)
    .join(", ");

  console.log("setString", setString);
  if (setString.length === 0) return;

  try {
    const {
      rows: [user],
    } = await client.query(
      `
    UPDATE users
    SET ${setString}
    WHERE id= $1
    RETURNING *;
   `,
      [userId, ...Object.values(fields)]
    );
    return user;
  } catch (error) {
    throw error;
  }
};

const updatePost = async (postId, fields = {}) => {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 2}`
  );
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      UPDATE posts
      SET ${setString}
      WHERE id = $1
      RETURNING *;
    `,
      [postId, ...Object.values(fields)]
    );
    return post;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  client,
  getAllUsers,
  getAllPosts,
  getPostsByUser,
  getUserById,
  createUser,
  createPost,
  updateUser,
  updatePost,
};
