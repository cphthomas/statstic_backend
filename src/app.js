const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const apiRouter = require("./routes/routes");
var cron = require("node-cron");
var shell = require("shelljs");

// init app
const app = express();

// app.use(
//   cors({
//     origin: "*",
//   })
// );

const allowedOrigins = [
  "https://s.tepedu.com",
  "https://jura.tepedu.com",
  "https://localhost:5000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.get("/", (req, res) => {
  const targetUrl = "https://www.tepedu.dk/";
  res.redirect(targetUrl);
});

app.get("/app", (req, res) => {
  return res.send({ data: [{ name: "abc" }, { name: "bbb" }] });
});

// body parser
// app.use(express.json());
app.use((req, res, next) => {
  console.log("req.originalUrl", req.originalUrl);
  if (
    req.originalUrl === "/app/api/checkout-complete" ||
    req.originalUrl === "/app/api/subscription-deleted" ||
    req.originalUrl === "/app/api/checkout-complete-jura" ||
    req.originalUrl === "/app/api/subscription-deleted-jura" ||
    req.originalUrl === "/app/api/checkout-complete-esg" ||
    req.originalUrl === "/app/api/subscription-deleted-esg"
  ) {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// define api and web router
app.use("/app/api", apiRouter);

// export app module
module.exports = app;
