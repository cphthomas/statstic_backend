const dbConfig = {
  host: "164.92.213.12",
  database: "books",
  user: "thomas",
  password: "1Thomas@stat",
};

const STAT_BOOK_NAME = "Statistik";
const STAT_BOOK_URL = "https://s.tepedu.com/";
// const STAT_SK_KEY = "sk_test_5fe6JJATRk7ErzfTyy2iYp2O00usmCOV2l";
const STAT_SK_KEY = "sk_live_X0i7HSx2c4XujPyZAp36UZz0";
const STAT_CHECKOUT_WEBHOOK = "whsec_AP6RS8npWZgkSoJeKuW3oxWsxRbfYZAW";
const STAT_SUBSCRIPTION_DELETE_WEBHOOK =
  "whsec_eti6tU32xKS3bs9tbWSU70ZJhqOfO1WF";
STAT_BOOK_PRICES = [
  "price_1JJ3RhAobCjt2PuEqdcAa7rC",
  "price_1JJ3QpAobCjt2PuEo9cWsuNX",
  "price_1JJ3PTAobCjt2PuENGqQVOxr",
  "price_1LPqsXAobCjt2PuEDFDhZnTS",
  "price_1LPqtEAobCjt2PuEQM772wyu",
  "price_1LPqtrAobCjt2PuEdvSNpti0",
  "price_1LPquTAobCjt2PuEmTjWyuIM",
];

const JURA_BOOK_NAME = "Jura";
const JURA_BOOK_URL = "http://jura.tepedu.com/";
//const JURA_SK_KEY = "sk_test_oNMafQw2sfljLec3xk0pZSIi";
const JURA_SK_KEY = "sk_live_I26tx7eHQRswhIfiDk2X3LBc";
const JURA_CHECKOUT_WEBHOOK = "whsec_Chzy5VMLSAKbhpBbe15OvRvwF37jOC6G";
const JURA_SUBSCRIPTION_DELETE_WEBHOOK =
  "whsec_M8g8ugIkrowt5zb1nxw2Xmosd19HJhSZ";
JURA_BOOK_PRICES = [
  "price_1JKRkOJsPOEBHB7ss4DF9sqt",
  "price_1JKRkXJsPOEBHB7ss8rXJEHm",
  "price_1JKRkeJsPOEBHB7s8jekHsfA",
  "price_1LPql5JsPOEBHB7seHpqglj4",
  "price_1LPqlrJsPOEBHB7s1OkS0ZXQ",
  "price_1LPqmMJsPOEBHB7sNUOMyFbr",
  "price_1LPqn2JsPOEBHB7sAJf2Pibn",
];

const ESG_BOOK_NAME = "Esg";
const ESG_BOOK_URL = "http://esg.tepdu.com/";
const ESG_SK_KEY =
  "sk_test_51JtdErCcBUqlBY9HNkvAeoSrR6jH7WviuW55Lnspmkl17hsyi8LKrm4xvfZCztkq2riLsdEmW6CHRMw44CtibrYV00DD01wNQ0";
const ESG_CHECKOUT_WEBHOOK = "whsec_k5I3vWT9GEYE14C7Q1Lm2wIG8TTwOlvD";
const ESG_SUBSCRIPTION_DELETE_WEBHOOK =
  "whsec_3PAXTyE7GTquseBWHAd8OkWn5H8ut6oe";
ESG_BOOK_PRICES = [
  "price_1JttuGCcBUqlBY9HfICty6MA",
  "price_1JttuVCcBUqlBY9HAyXUMCBL",
  "price_1NVTsVCcBUqlBY9HnWyIb9Lv",
  "price_1NVTuYCcBUqlBY9HoLPA6fl8",
  "price_1NVTvGCcBUqlBY9HRfa7q6LM",
  "price_1NVTvqCcBUqlBY9HyeM6RI3z",
  "price_1NVTwPCcBUqlBY9Hd82s6df6",
];

module.exports = {
  dbConfig,
  STAT_BOOK_NAME,
  STAT_BOOK_URL,
  STAT_SK_KEY,
  STAT_CHECKOUT_WEBHOOK,
  STAT_SUBSCRIPTION_DELETE_WEBHOOK,
  STAT_BOOK_PRICES,
  JURA_BOOK_NAME,
  JURA_BOOK_URL,
  JURA_SK_KEY,
  JURA_CHECKOUT_WEBHOOK,
  JURA_SUBSCRIPTION_DELETE_WEBHOOK,
  JURA_BOOK_PRICES,
  ESG_BOOK_NAME,
  ESG_BOOK_URL,
  ESG_SK_KEY,
  ESG_CHECKOUT_WEBHOOK,
  ESG_SUBSCRIPTION_DELETE_WEBHOOK,
  ESG_BOOK_PRICES,
};
