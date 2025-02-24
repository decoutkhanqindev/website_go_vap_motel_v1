const mongoose = require("mongoose");

const configMongodb = (URI) => {
  mongoose
    .connect(URI, {
      // if mongodb server is down, after 5s your mongoose.connect()
      // call will only throw an error
      serverSelectionTimeoutMS: 5000
    })
    .then(() => {
      console.log("\n### Database connected successful");
    })
    .catch((error) => {
      console.log(`\n### Database connection have error:\n${error}`);
      throw error;
    });
};

module.exports = configMongodb;
