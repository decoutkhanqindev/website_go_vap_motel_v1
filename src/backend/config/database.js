const mongoose = require("mongoose");
const logger = require("./logger");

const connectMongoDB = (URI) => {
  mongoose
    .connect(URI, {
      // if mongodb server is down, after 5s your mongoose.connect()
      // call will only throw an error
      serverSelectionTimeoutMS: 5000
    })
    .then(() => {
      logger.info("MongoDB connected successful");
    })
    .catch((error) => {
      logger.error(`Mongodb connection have error\n${error}`);
      throw error;
    });
};

module.exports = connectMongoDB;
