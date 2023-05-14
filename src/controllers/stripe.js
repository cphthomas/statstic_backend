const {
  dbConfig,
  STAT_SK_KEY,
  STAT_SUBSCRIPTION_DELETE_WEBHOOK,
  JURA_SK_KEY,
  JURA_CHECKOUT_WEBHOOK,
  JURA_SUBSCRIPTION_DELETE_WEBHOOK,
  STAT_BOOK_NAME,
  JURA_BOOK_NAME,
  STAT_BOOK_URL,
  JURA_BOOK_URL,
  STAT_BOOK_PRICES,
  JURA_BOOK_PRICES,
} = require("../constants");

const Stripe = require("stripe");
const connection = require("serverless-mysql")({
  config: dbConfig,
});

createCheckout = async (req, res) => {
  const { email, customerId, planType, bookToAccess } = req.body;
  let skKey = "";
  let proPrice = "";
  let premiumPrice = "";
  let monthlySixtyPrice = "";
  let sixMonthOneTimePrice = "";
  let twelveMonthOneTimePrice = "";
  let twentyFourMonthOneTimePrice = "";
  let bookURL = "";
  if (bookToAccess === STAT_BOOK_NAME) {
    skKey = STAT_SK_KEY;
    proPrice = STAT_BOOK_PRICES[1];
    premiumPrice = STAT_BOOK_PRICES[2];
    monthlySixtyPrice = STAT_BOOK_PRICES[3];
    sixMonthOneTimePrice = STAT_BOOK_PRICES[4];
    twelveMonthOneTimePrice = STAT_BOOK_PRICES[5];
    twentyFourMonthOneTimePrice = STAT_BOOK_PRICES[6];
    bookURL = STAT_BOOK_URL;
  } else if (bookToAccess === JURA_BOOK_NAME) {
    skKey = JURA_SK_KEY;
    proPrice = JURA_BOOK_PRICES[1];
    premiumPrice = JURA_BOOK_PRICES[2];
    monthlySixtyPrice = JURA_BOOK_PRICES[3];
    sixMonthOneTimePrice = JURA_BOOK_PRICES[4];
    twelveMonthOneTimePrice = JURA_BOOK_PRICES[5];
    twentyFourMonthOneTimePrice = JURA_BOOK_PRICES[6];
    bookURL = JURA_BOOK_URL;
  }
  const stripe = new Stripe(skKey);

  let price = "";
  let mode = "";
  if (planType == "pro") {
    price = proPrice;
    mode = "subscription";
  } else if (planType == "premium") {
    price = premiumPrice;
    mode = "subscription";
  } else if (planType == "monthly_sixty") {
    price = monthlySixtyPrice;
    mode = "subscription";
  } else if (planType == "six_months_one_time") {
    price = sixMonthOneTimePrice;
    mode = "payment";
  } else if (planType == "twelve_months_one_time") {
    price = twelveMonthOneTimePrice;
    mode = "payment";
  } else if (planType == "twenty_four_months_one_time") {
    price = twentyFourMonthOneTimePrice;
    mode = "payment";
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    success_url: bookURL,
    cancel_url: bookURL,
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

checkoutCompleteStat = async (req, res) => {
  checkoutComplete(
    req,
    res,
    STAT_SK_KEY,
    STAT_CHECKOUT_WEBHOOK,
    STAT_BOOK_NAME
  );
};

subscriptionDeletedStat = async (req, res) => {
  subscriptionDeleted(
    req,
    res,
    STAT_SK_KEY,
    STAT_SUBSCRIPTION_DELETE_WEBHOOK,
    STAT_BOOK_NAME,
    STAT_BOOK_PRICES
  );
};

checkoutCompleteJura = async (req, res) => {
  checkoutComplete(
    req,
    res,
    JURA_SK_KEY,
    JURA_CHECKOUT_WEBHOOK,
    JURA_BOOK_NAME
  );
};

subscriptionDeletedJura = async (req, res) => {
  subscriptionDeleted(
    req,
    res,
    JURA_SK_KEY,
    JURA_SUBSCRIPTION_DELETE_WEBHOOK,
    JURA_BOOK_NAME,
    JURA_BOOK_PRICES
  );
};

customerPaymentMethod = async (req, res) => {
  const { customerStripeId, bookToAccess } = req.body;

  let skKey = "";
  if (bookToAccess === STAT_BOOK_NAME) {
    skKey = STAT_SK_KEY;
  } else if (bookToAccess === JURA_BOOK_NAME) {
    skKey = JURA_SK_KEY;
  }
  const stripe = new Stripe(skKey);

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
  const { customerStripeId, bookToAccess } = req.body;

  let skKey = "";
  if (bookToAccess === STAT_BOOK_NAME) {
    skKey = STAT_SK_KEY;
  } else if (bookToAccess === JURA_BOOK_NAME) {
    skKey = JURA_SK_KEY;
  }
  const stripe = new Stripe(skKey);

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
  const { userStripeId, bookToAccess } = req.body;

  let skKey = "";
  if (bookToAccess === STAT_BOOK_NAME) {
    skKey = STAT_SK_KEY;
  } else if (bookToAccess === JURA_BOOK_NAME) {
    skKey = JURA_SK_KEY;
  }
  const stripe = new Stripe(skKey);

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
  const { userStripeId, bookToAccess } = req.body;

  let skKey = "";
  if (bookToAccess === STAT_BOOK_NAME) {
    skKey = STAT_SK_KEY;
  } else if (bookToAccess === JURA_BOOK_NAME) {
    skKey = JURA_SK_KEY;
  }
  const stripe = new Stripe(skKey);

  const intent = await stripe.setupIntents.create({
    customer: userStripeId,
  });

  return res.send({
    statusCode: 200,
    body: { intent },
  });
};

updatePaymentMethod = async (req, res) => {
  const { us, pm, bookToAccess } = req.body;

  let skKey = "";
  if (bookToAccess === STAT_BOOK_NAME) {
    skKey = STAT_SK_KEY;
  } else if (bookToAccess === JURA_BOOK_NAME) {
    skKey = JURA_SK_KEY;
  }
  const stripe = new Stripe(skKey);

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
  paymentIntent,
  bookToAccess
) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "UPDATE external_users SET plan_id = ?, user_subscription_end = ?, user_subscription_start = ?, stripe_mail = ?, payment_intent = ?, book_access = ? WHERE stripe_id = ?",
        timeout: 10000,
        values: [
          plan,
          planEnd,
          planStart,
          stripeEmail,
          paymentIntent,
          bookToAccess,
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

async function updateUserDelete(connection, stripeId, plan, bookToAccess) {
  return new Promise((resolve, reject) => {
    connection.query(
      {
        sql: "UPDATE external_users SET plan_id = ?, book_access = ? WHERE stripe_id = ?",
        timeout: 10000,
        values: [plan, bookToAccess, stripeId],
      },
      function (error, results, fields) {
        if (error) reject(err);
        resolve(results);
      }
    );
  });
}

async function checkoutComplete(req, res, skKey, signature) {
  const stripe = new Stripe(skKey);

  try {
    const stripeEvent = await stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      signature
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
    } catch (error) {
      return res.send({
        status: 400,
        body: `Webhook Error: ${error.message}`,
      });
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function subscriptionDeleted(
  req,
  res,
  skKey,
  signature,
  bookToAccess,
  prices
) {
  const stripe = new Stripe(skKey);
  try {
    const stripeEvent = await stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      signature
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
          if (element.plan.id == prices[0]) {
            newPlan = 0;
          } else if (element.plan.id == prices[1]) {
            newPlan = 1;
          } else if (element.plan.id == prices[2]) {
            newPlan = 2;
          } else if (element.plan.id == prices[3]) {
            newPlan = 3;
          } else if (element.plan.id == prices[4]) {
            newPlan = 4;
          } else if (element.plan.id == prices[5]) {
            newPlan = 5;
          } else if (element.plan.id == prices[6]) {
            newPlan = 6;
          }
        } else {
          newPlan = 0;
        }
      });

      await updateUserDelete(
        connection,
        subscription.customer,
        newPlan,
        bookToAccess
      );

      await connection.end();

      return res.send({
        status: 200,
        body: { received: subscription.customer },
      });
    } catch (error) {
      return res.send({
        status: 400,
        body: `Webhook Error: ${error.message}`,
      });
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
  }
}

module.exports = {
  createCheckout,
  checkoutCompleteStat,
  subscriptionDeletedStat,
  checkoutCompleteJura,
  subscriptionDeletedJura,
  customerPaymentMethod,
  customerInvoices,
  cancelSubscription,
  setupIntent,
  updatePaymentMethod,
};
