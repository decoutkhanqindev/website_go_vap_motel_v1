const mongoose = require("mongoose");

const configMongodb = (URI) => {
  mongoose
    .connect(URI)
    .then(() => {
      console.log("\n>>> Database connected successful.");
    })
    .catch((error) => {
      console.log(`\n>>> Database connection have error:\n${error}.`);
      throw error;
    });
};

module.exports = configMongodb;
