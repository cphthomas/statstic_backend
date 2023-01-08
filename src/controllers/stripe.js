const stripe = require("stripe")("sk_test_5fe6JJATRk7ErzfTyy2iYp2O00usmCOV2l");
const connection = require("serverless-mysql")({
  config: {
    host: "lmc8ixkebgaq22lo.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
    database: "yj4gfzv5wypf9871",
    user: "ub4b7vh6mgd73b2b",
    password: "l7w4d31in0msovsc",
  },
});

createCheckout = async (req, res) => {
  const { email, customerId, planType } = req.body;

  let price = "";
  let mode = "";
  if (planType == "pro") {
    price = "price_1JG5RUCzlGux4vukvLMkjRmC";
    mode = "subscription";
  } else if (planType == "premium") {
    price = "price_1JG5SZCzlGux4vukHzvKvoVs";
    mode = "subscription";
  } else if (planType == "monthly_sixty") {
    price = "price_1LPTKzCzlGux4vukN3IZ6pAK";
    mode = "subscription";
  } else if (planType == "six_months_one_time") {
    price = "price_1LPTMUCzlGux4vukG5A78THC";
    mode = "payment";
  } else if (planType == "twelve_months_one_time") {
    price = "price_1LPTP2CzlGux4vuknzCP892m";
    mode = "payment";
  } else if (planType == "twenty_four_months_one_time") {
    price = "price_1LPTQWCzlGux4vukLJibjtcp";
    mode = "payment";
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    success_url: "http://stat.tepdu.com/",
    cancel_url: "http://stat.tepdu.com/",
    payment_method_types: ["card"],
    line_items: [{ price: price, quantity: 1 }],
    mode: mode,
    //customer_email: email,
  });

  return res.send({
    statusCode: 200,
    body: { session: session },
  });
};

// checkoutComplete = async ({ body, headers }, context) => {
checkoutComplete = async (req, res) => {
  try {
    const stripeEvent = await stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      "whsec_jgmjekj4G4Jtln0Hr4MpbjVsFdmlBWev"
    );

    if (stripeEvent.type !== "checkout.session.completed") return;

    const subscription = await stripeEvent.data.object;
    const newSubscriptionId = await subscription.subscription;
    const paymentIntent = await subscription.payment_intent;
    const subscriptionStart = Date.now();
    let subscriptionEnd = "";

    let plan = "0";
    if (subscription.amount_total == "4900") {
      plan = "1";
      subscriptionEnd = Date.now();
    } else if (subscription.amount_total == "6900") {
      plan = "2";
      subscriptionEnd = Date.now();
    } else if (subscription.amount_total == "5900") {
      plan = "3";
      subscriptionEnd = Date.now();
    } else if (subscription.amount_total == "29000") {
      plan = "4";
      subscriptionEnd = subscriptionStart + 1000 * 60 * 60 * 24 * 180;
    } else if (subscription.amount_total == "39000") {
      plan = "5";
      subscriptionEnd = subscriptionStart + 1000 * 60 * 60 * 24 * 360;
    } else if (subscription.amount_total == "54000") {
      plan = "6";
      subscriptionEnd = subscriptionStart + 1000 * 60 * 60 * 24 * 720;
    }

    try {
      await connection.connect();

      await updateUser(
        connection,
        subscription.customer,
        subscriptionEnd,
        subscriptionStart,
        plan,
        subscription.customer_details.email,
        paymentIntent
      );

      await connection.end();

      const userAllSubscriptions = await stripe.subscriptions.list({
        customer: subscription.customer,
      });

      await userAllSubscriptions.data.forEach(async (element) => {
        if (element.id != newSubscriptionId) {
          stripe.subscriptions.update(element.id, {
            pause_collection: { behavior: "mark_uncollectible" },
          });
        }
      });
      return res.send({
        status: 200,
        body: { received: subscription.customer },
      });
      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({ received: subscription.customer }),
      // };
    } catch (error) {
      return res.send({
        status: 400,
        body: `Webhook Error: ${error.message}`,
      });
      // return {
      //   statusCode: 400,
      //   body: `Webhook Error: ${error.message}`,
      // };
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
    // return {
    //   statusCode: 400,
    //   body: `Webhook Error: ${err.message}`,
    // };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

subscriptionDeleted = async (req, res) => {
  try {
    const stripeEvent = await stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      "whsec_jOwO2ytLcWZoTWe1NGQt82Rab5K2zxJu"
    );
    if (stripeEvent.type !== "customer.subscription.deleted") return;

    const subscription = await stripeEvent.data.object;

    try {
      await connection.connect();

      const userAllSubscriptions = await stripe.subscriptions.list({
        customer: subscription.customer,
        limit: 1,
      });

      let newPlan = 0;
      await userAllSubscriptions.data.forEach(async (element) => {
        if (element.status == "active" && element.pause_collection == null) {
          if (element.plan.id == "price_1JG5QWCzlGux4vukFQ7r6q5Y") {
            newPlan = 0;
          } else if (element.plan.id == "price_1JG5RUCzlGux4vukvLMkjRmC") {
            newPlan = 1;
          } else if (element.plan.id == "price_1JG5SZCzlGux4vukHzvKvoVs") {
            newPlan = 2;
          } else if (element.plan.id == "price_1LPTKzCzlGux4vukN3IZ6pAK") {
            newPlan = 3;
          } else if (element.plan.id == "price_1LPTMUCzlGux4vukG5A78THC") {
            newPlan = 4;
          } else if (element.plan.id == "price_1LPTP2CzlGux4vuknzCP892m") {
            newPlan = 5;
          } else if (element.plan.id == "price_1LPTQWCzlGux4vukLJibjtcp") {
            newPlan = 6;
          }
        } else {
          newPlan = 0;
        }
      });

      await updateUserDelete(connection, subscription.customer, newPlan);

      await connection.end();

      return res.send({
        status: 200,
        body: { received: subscription.customer },
      });

      // return {
      //   statusCode: 200,
      //   body: JSON.stringify({ received: subscription.customer }),
      // };
    } catch (error) {
      return res.send({
        status: 400,
        body: `Webhook Error: ${error.message}`,
      });
      // return {
      //   statusCode: 400,
      //   body: `Webhook Error: ${error.message}`,
      // };
    } finally {
      if (connection) {
        connection.end();
      }
    }
  } catch (error) {
    return res.send({
      status: 400,
      body: `Webhook Error: ${error.message}`,
    });
    // return {
    //   statusCode: 400,
    //   body: `Webhook Error: ${error.message}`,
    // };
  }
};

customerPaymentMethod = async (req, res) => {
  const { customerStripeId } = req.body;

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerStripeId,
    type: "card",
  });

  return res.send({
    statusCode: 200,
    body: { paymentMethods },
  });
};

customerInvoices = async (req, res) => {
  const { customerStripeId } = req.body;

  const invoices = await stripe.invoices.list({
    customer: customerStripeId,
    limit: 1,
  });

  return res.send({
    statusCode: 200,
    body: { invoices },
  });
};

cancelSubscription = async (req, res) => {
  const { userStripeId } = req.body;

  const subscriptions = await stripe.subscriptions.list({
    customer: userStripeId,
  });

  if (subscriptions.data[0].cancel_at_period_end) {
    return res.send({
      statusCode: 200,
      body: {
        error: "1",
        message: "Du har allerede afmeldt dit abonnement.",
      },
    });
  }

  await subscriptions.data.forEach(async (element) => {
    stripe.subscriptions.update(element.id, { cancel_at_period_end: true });
  });

  return res.send({
    statusCode: 200,
    body: {
      error: "0",
      message:
        "Dit abonnement er nu afmeldt, det stopper automatisk ved udløb af abonnementsperioden. Du modtager ikke flere regninger.",
    },
  });
};

setupIntent = async (req, res) => {
  const { userStripeId } = req.body;

  const intent = await stripe.setupIntents.create({
    customer: userStripeId,
  });

  return res.send({
    statusCode: 200,
    body: { intent },
  });
};

updatePaymentMethod = async (req, res) => {
  const { us, pm } = req.body;

  const paymentMethod = await stripe.paymentMethods.attach(pm, {
    customer: us,
  });

  const customer = await stripe.customers.update(us, {
    invoice_settings: {
      default_payment_method: pm,
    },
  });

  return res.send({
    statusCode: 200,
    body: { paymentMethod },
  });
};

async function updateUser(
  connection,
  stripeId,
  planEnd,
  planStart,
  plan,
  stripeEmail,
  paymentIntent
) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "UPDATE external_users SET plan_id = ?, user_subscription_end = ?, user_subscription_start = ?, stripe_mail = ?, payment_intent = ? WHERE stripe_id = ?",
        timeout: 10000,
        values: [
          plan,
          planEnd,
          planStart,
          stripeEmail,
          paymentIntent,
          stripeId,
        ],
      },
      function (error, results, fields) {
        if (error) reject(err);
        resolve(results);
      }
    );
  });
}

async function updateUserDelete(connection, stripeId, plan) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "UPDATE external_users SET plan_id = ? WHERE stripe_id = ?",
        timeout: 10000,
        values: [plan, stripeId],
      },
      function (error, results, fields) {
        if (error) reject(err);
        resolve(results);
      }
    );
  });
}

module.exports = {
  createCheckout,
  checkoutComplete,
  subscriptionDeleted,
  customerPaymentMethod,
  customerInvoices,
  cancelSubscription,
  setupIntent,
  updatePaymentMethod,
};
