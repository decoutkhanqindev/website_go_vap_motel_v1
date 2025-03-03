const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectMongoDB = (URI) => {
  mongoose
    .connect(URI, {
      serverSelectionTimeoutMS: 5000
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    })
    .then(() => {
      logger.info("Mongodb Cloud Atlas connected successful.");
    })
    .catch((error) => {
      logger.error(`Mongodb Cloud Atlas connection have error:\n${error}`);
      throw error;
    });
};

module.exports = connectMongoDB;
