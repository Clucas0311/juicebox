const { Client } = require("pg"); // imports the pg module so we can use pg

// runs our server on port 5432
const client = new Client("postgres://localhost:5432/juicebox-dev");

const getAllUsers = async () => {
  const { rows } = await client.query(`
        SELECT id, username
        FROM users;
    `);
  return rows;
};

module.exports = {
  client,
  getAllUsers,
};
