const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const apiRouter = require("./routes/routes");
var cron = require("node-cron");
var shell = require("shelljs");

// init app
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.get("/app", (req, res) => {
  return res.send({ data: [{ name: "abc" }, { name: "bbb" }] });
});

// body parser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// define api and web router
app.use("/app/api", apiRouter);

// export app module
module.exports = app;
