const express = require("express");
const router = new express.Router();
const test = require("../controllers/test");

// Test GET API
router.get("/test-api", test.index);

// Test POST API
router.post("/test-post-api", test.indexPost);

module.exports = router;
