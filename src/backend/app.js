require("dotenv").config();
const express = require("express");
const configMongoDB = require("../backend/config/configMongodb");

const app = express();
const env = process.env;
const PORT = env.PORT || 8080;
const MONGO_DB_URI = env.MONGO_DB_URI;

// connect to mongodb
configMongoDB(MONGO_DB_URI);

app.listen(PORT, () => {
  console.log(
    `\n>>> Server is running at http://localhost:${PORT}/.`
  );
});
