let uniqid = require("uniqid");
const { dbConfig } = require("../constants");
const Stripe = require("stripe");

const connection = require("serverless-mysql")({
  config: dbConfig,
});

login = async (req, res) => {
  const { email, password, bookToAccess } = req.body;

  let existUserResult;
  let userIp = "";
  try {
    await connection.connect();
    existUserResult = await getUserDetailByEmailAndPassword(
      connection,
      email,
      password,
      bookToAccess
    );
    if (!existUserResult[0]) {
      await connection.end();
      return res.send({
        statusCode: 200,
        body: {
          error: "1",
          message: "Forkert email eller password",
        },
      });
    }
    userIp = await uniqid();

    await updateUser(connection, existUserResult[0].user_email, userIp, bookToAccess);

    await connection.end();
  } catch (e) {
    console.log(`User not logged in due to error= ${e}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  return res.send({
    statusCode: 200,
    body: {
      error: "0",
      customerId: existUserResult[0].stripe_id,
      planId: existUserResult[0].plan_id,
      emailId: existUserResult[0].user_email,
      userIp: userIp,
      message: "Bruger logget ind",
    },
  });
};

signUp = async (req, res) => {
  const { email, password, name, bookToAccess } = req.body;
  let existUserResult;
  userIp = "";
  let customer;
  const stripe = new Stripe('sk_test_5fe6JJATRk7ErzfTyy2iYp2O00usmCOV2l');
  try {
    await connection.connect();
    existUserResult = await getUserDetailByEmail(connection, email, bookToAccess);
    if (existUserResult[0] && existUserResult[0].user_email) {
      await connection.end();
      return res.send({
        statusCode: 200,
        body: {
          error: "1",
          message: "Der findes allerede en bruger med denne email",
        },
      });
    }

    customer = await stripe.customers.create({
      email: email,
    });

    // subscribe the new customer to the free plan
    const createdSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: "price_1JG5QWCzlGux4vukFQ7r6q5Y" }],
    });

    // update subscription, pause payment
    await stripe.subscriptions.update(createdSubscription.id, {
      pause_collection: { behavior: "mark_uncollectible" },
    });

    userIp = await uniqid();

    let member = {
      user_name: name,
      user_email: email,
      user_password: password,
      stripe_id: customer.id,
      plan_id: "0",
      is_logged_in: 1,
      user_ip: userIp,
      book_access: bookToAccess,
    };
    try {
      let query = await connection.query({
        sql: "INSERT INTO external_users SET ?",
        timeout: 20000,
        values: [member],
      });
    } catch (e) {
      console.log(`User not created= ${e}`);
    }

    await connection.end();
  } catch (e) {
    console.log(`Not signup due to error= ${e}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  return res.send({
    statusCode: 200,
    body: {
      error: "0",
      customerId: customer.id,
      userIp: userIp,
      message: "Bruger opretter du sendes til Stripe checkout...",
    },
  });
};

async function getUserDetailByEmail(connection, email, bookToAccess) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "SELECT * FROM `external_users` WHERE `user_email` = ? AND `book_access` = ?",
        timeout: 10000,
        values: [email, bookToAccess],
      },
      function (error, results, fields) {
        if (error) reject(err);
        resolve(results);
      }
    );
  });
}

async function getUserDetailByEmailAndPassword(connection, email, password, bookToAccess) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "SELECT * FROM `external_users` WHERE `user_email` = ? AND `user_password` = ? AND `book_access` = ?",
        timeout: 10000,
        values: [email, password, bookToAccess],
      },
      function (error, results, fields) {
        if (error) reject(err);
        resolve(results);
      }
    );
  });
}

async function updateUser(connection, userEmail, userIp, bookToAccess) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "UPDATE external_users SET user_ip = ? WHERE user_email = ? AND `book_access` = ?",
        timeout: 10000,
        values: [userIp, userEmail, bookToAccess],
      },
      function (error, results, fields) {
        if (error) reject(err);
        resolve(results);
      }
    );
  });
}

module.exports = {
  login,
  signUp,
};
