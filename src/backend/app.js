require("dotenv").config();
const express = require("express");
const connectMongoDB = require("./config/database");
const logger = require("./config/logger");

const app = express();
const env = process.env;
const PORT = env.PORT || 8080;
const MONGO_DB_URI = env.MONGO_DB_URI;

app.listen(PORT, () => {
  logger.info(`Server is running at [http://localhost:${PORT}]`);
});

connectMongoDB(MONGO_DB_URI)
