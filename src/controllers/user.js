const connection = require("serverless-mysql")({
  config: {
    host: "lmc8ixkebgaq22lo.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
    database: "yj4gfzv5wypf9871",
    user: "ub4b7vh6mgd73b2b",
    password: "l7w4d31in0msovsc",
  },
});

findUser = async (req, res) => {
  const { userEmail } = req.body;

  let user = "";
  try {
    await connection.connect();
    user = await getUser(connection, userEmail);
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

async function getUser(connection, email) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "SELECT * FROM `external_users` WHERE `user_email` = ? AND `book_access` = ?",
        timeout: 10000,
        values: [email, "Test"],
      },
      function (error, results, fields) {
        if (error) reject(error);
        resolve(results);
      }
    );
  });
}

module.exports = {
  findUser,
};
