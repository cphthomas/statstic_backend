const { dbConfig } = require("../constants");

const connection = require("serverless-mysql")({
  config: dbConfig,
});

findUser = async (req, res) => {
  const { userEmail, bookToAccess } = req.body;

  let user = "";
  try {
    await connection.connect();
    user = await getUser(connection, userEmail, bookToAccess);
    await connection.end();
  } catch (e) {
    console.log(`User not found due to error= ${e}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  return res.send({
    statusCode: 200,
    body: {
      user: user,
    },
  });
};

changePassword = async (req, res) => {
  const { email, password, bookToAccess } = req.body;
  await connection.connect();

  try {
    const existUserResult = await getUser(connection, email, bookToAccess);

    if (!existUserResult[0]) {
      await connection.end();
      return res.send({
        statusCode: 200,
        body: {
          error: "1",
          message: "Der findes ingen bruger med denne email",
        },
      });
    }

    await updateUser(connection, email, password, bookToAccess);

    await connection.end();
  } catch (e) {
    console.log(`Password not changed due to error= ${e}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  return res.send({
    statusCode: 200,
    body: {
      error: "0",
      message: "Password er nu ændret du sendes til login siden...",
    },
  });
};

async function getUser(connection, email, bookToAccess) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "SELECT * FROM `external_users` WHERE `user_email` = ? AND `book_access` = ?",
        timeout: 10000,
        values: [email, bookToAccess],
      },
      function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      }
    );
  });
}

async function updateUser(connection, userEmail, password, bookToAccess) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "UPDATE external_users SET user_password = ? WHERE user_email = ? AND `book_access` = ?",
        timeout: 10000,
        values: [password, userEmail, bookToAccess],
      },
      function (error, results, fields) {
        if (error) reject(err);
        resolve(results);
      }
    );
  });
}

module.exports = {
  findUser,
  changePassword,
};
