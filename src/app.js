require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectMongoDB = require("./backend/configs/databaseConfig");
const logger = require("./backend/utils/logger");
const requestLoggingMiddleware = require("./backend/middlewares/requestLoggingMiddleware");
const errorHandlingMiddleware = require("./backend/middlewares/errorHandlingMiddleware");
const apiRoute = require("./backend/routes/apiRoute");
const clientRoute = require("./backend/routes/clientRoute");

const app = express();
const env = process.env;
const PORT = env.PORT || 8080;
// const HOSTNAME = env.HOSTNAME || "localhost";
const MONGO_DB_URI = env.MONGO_DB_URI;

app.use(
  cors({
    credentials: true,
    origin: `http://localhost:${PORT}`
  })
); // middleware enables Cross-Origin Resource Sharing (CORS)
app.use(express.json()); // middleware parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // middleware parses incoming requests with URL-encoded payloads
app.use(cookieParser()); // middleware parses cookies attached to incoming requests
app.use(express.static(path.join(__dirname, "frontend")));
app.use(requestLoggingMiddleware); // middleware handle request Logging
app.use("/api", apiRoute); // middleware handle all api routes
app.use("/", clientRoute); // middleware handle all client routes
app.use(errorHandlingMiddleware); // middleware handle common error

app.listen(PORT, () => {
  logger.info(`Server is running at PORT ${PORT}.`);
});

connectMongoDB(MONGO_DB_URI);
