const stripe = require("stripe")("sk_test_5fe6JJATRk7ErzfTyy2iYp2O00usmCOV2l");

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
module.exports = {
  createCheckout,
};
