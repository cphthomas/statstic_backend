const express = require("express");
const router = new express.Router();
const test = require("../controllers/test");
const auth = require("../controllers/auth");
const stripe = require("../controllers/stripe");

// Test GET API
router.get("/test-api", test.index);

// Test POST API
router.post("/test-post-api", test.indexPost);

// Auth
router.post("/login", auth.login);
router.post("/sign-up", auth.signUp);

// Stripe
router.post("/create-stripe-checkout", stripe.createCheckout);
router.post(
  "/checkout-complete",
  express.raw({ type: "application/json" }),
  stripe.checkoutComplete
);
router.post(
  "/subscription-deleted",
  express.raw({ type: "application/json" }),
  stripe.subscriptionDeleted
);

module.exports = router;
