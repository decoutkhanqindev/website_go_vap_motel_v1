require("dotenv").config();
const express = require("express");
const connectMongoDB = require("./config/databaseConfig");
const logger = require("./utils/logger");
const requestLoggingMiddleware = require("./middlewares/requestLoggingMiddleware");
const errorHandlingMiddleware = require("./middlewares/errorHandlingMiddleware");
const router = require("./routes/apiRoute");

const app = express();
const env = process.env;
const PORT = env.PORT || 8080;
const MONGO_DB_URI = env.MONGO_DB_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLoggingMiddleware); // middleware handle request Logging
app.use("/api", router);
app.use(errorHandlingMiddleware); // middleware handle common error

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}.`);
});

connectMongoDB(MONGO_DB_URI);
