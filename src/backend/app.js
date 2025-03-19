require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectMongoDB = require("./configs/databaseConfig");
const logger = require("./utils/logger");
const requestLoggingMiddleware = require("./middlewares/requestLoggingMiddleware");
const errorHandlingMiddleware = require("./middlewares/errorHandlingMiddleware");
const router = require("./routes/apiRoutes");

const app = express();
const env = process.env;
const PORT = env.PORT || 8080;
const HOSTNAME = env.HOSTNAME || "localhost";
const MONGO_DB_URI = env.MONGO_DB_URI;

app.use(express.json()); // middleware parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // middleware parses incoming requests with URL-encoded payloads
app.use(
  cors({
    credentials: true,
    origin: `http://${HOSTNAME}:${PORT}`,
  })
); // middleware enables Cross-Origin Resource Sharing (CORS)
app.use(cookieParser()); // middleware parses cookies attached to incoming requests
app.use(requestLoggingMiddleware); // middleware handle request Logging
app.use("/api", router); // middleware handle all api routes
app.use(errorHandlingMiddleware); // middleware handle common error

app.listen(PORT, HOSTNAME, () => {
  logger.info(`Server is running at http://${HOSTNAME}:${PORT}.`);
});

connectMongoDB(MONGO_DB_URI);
