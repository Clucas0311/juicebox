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
    const { rows: postIds } = await client.query(`
      SELECT * 
      FROM posts;
    `);

    // We want all posts to have tags and authors
    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    console.log("posts in fet all posts", posts);
    return posts;
  } catch (error) {
    console.log("There was an error getting all posts!");
    throw error;
  }
};

const getPostsByUser = async (userId) => {
  try {
    const { rows: postIds } = await client.query(
      `
      SELECT * 
      FROM posts
      WHERE "authorId" = $1;
    `,
      [userId]
    );
    // Updates all posts with have the author and tags on it
    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    console.log("posts", posts);
    return posts;
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
    delete user.password;
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

const createPost = async ({ authorId, title, content, tags = [] }) => {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      INSERT INTO posts("authorId", title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
      [authorId, title, content]
    );

    // This populates our post tags for us so we can eliminate create Initial Posts
    const tagList = await createTags(tags);
    console.log("tagList in createPost", tagList);
    const result = await addTagsToPost(post.id, tagList);
    console.log("result in createPost ", result);
    return result;
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
  const { tags } = fields;
  delete fields.tags;

  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 2}`
  );
  try {
    if (setString.length > 0) {
      await client.query(
        `
      UPDATE posts
      SET ${setString}
      WHERE id= $1
      RETURNING *;
    `,
        [postId, ...Object.values(fields)]
      );
    }

    // return early if there's no tags to be updated
    if (tags === undefined) {
      return await getPostById(postId);
    }

    // make any new tags that need to be made
    const tagList = await createTags(tags);
    const tagListIdString = tagList.map((tag) => `${tag.id}`).join(", ");

    // DELETE any post that doesn't have a taglist
    await client.query(
      `
      DELETE FROM post_tags
      WHERE "tagId"
      NOT IN (${tagListIdString})
      AND "postId"=$1;
    `,
      [postId]
    );

    await addTagsToPost(postId, tagList);

    return await getPostById(postId);
  } catch (error) {
    console.log("Error in updating Posts");
    throw error;
  }
};

const createTags = async (tagList) => {
  if (tagList.length === 0) return [];

  const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");
  console.log("insertValues", insertValues);
  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");
  console.log("selectedValues", selectValues);

  try {
    await client.query(
      `
      INSERT INTO tags(name)
      VALUES (${insertValues})
      ON CONFLICT (name) DO NOTHING;
    `,
      tagList
    );

    const { rows } = await client.query(
      `
      SELECT * 
      FROM tags
      WHERE name
      IN (${selectValues});
    `,
      tagList
    );
    console.log("rows", rows);
    return rows;
  } catch (error) {
    console.log("There was an error creating tags");
    throw error;
  }
};

const createPostTag = async (postId, tagId) => {
  try {
    await client.query(
      `
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
    `,
      [postId, tagId]
    );
  } catch (error) {
    console.log("There was an error creating post tags");
    throw error;
  }
};

const addTagsToPost = async (postId, tagList) => {
  try {
    const createPostTagPromises = tagList.map((tag) =>
      createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);
    const result = await getPostById(postId);
    console.log("addTagsToPost result", result);
    return result;
  } catch (error) {
    throw error;
  }
};

const getAllTags = async () => {
  try {
    const { rows } = await client.query(`
      SELECT * 
      FROM tags;
    `);

    return { rows };
  } catch (error) {
    throw error;
  }
};

const getPostById = async (postId) => {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      SELECT *
      FROM posts
      WHERE id=$1;
    `,
      [postId]
    );

    const { rows: tags } = await client.query(
      `
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `,
      [post.authorId]
    );

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    throw error;
  }
};

const getPostsByTagName = async (tagName) => {
  try {
    const { rows: postIds } = await client.query(
      `
      SELECT posts.id
      FROM posts
      JOIN post_tags ON posts.id=post_tags."postId"
      JOIN tags ON tags.id=post_tags."tagId"
      WHERE tags.name=$1;
    `,
      [tagName]
    );

    return await Promise.all(postIds.map((post) => getPostById(post.id)));
  } catch (error) {
    console.log("There was an error that occured with getPostsByTagName");
    throw error;
  }
};

async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1;
    `,
      [username]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  getAllPosts,
  getAllTags,
  getPostsByUser,
  getUserByUsername,
  getUserById,
  getPostById,
  getPostsByTagName,
  createUser,
  createPost,
  createTags,
  createPostTag,
  addTagsToPost,
  updateUser,
  updatePost,
};
