const moment = require("moment-timezone");

const formatDateMiddleware = (fields) => {
  return (req, res, next) => {
    const dateFormats = ["DD/MM/YYYY", "DD-MM-YYYY", "YYYY-MM-DD"];

    for (const field of fields) {
      const dateValue =
        req.params[field] || req.query[field] || req.body[field];

      if (dateValue) {
        const formattedDate = moment(dateValue, dateFormats, true);
        if (formattedDate.isValid()) {
          if (req.body[field]) req.body[field] = formattedDate.toDate();
          if (req.query[field]) req.query[field] = formattedDate.toISOString();
          if (req.params[field])
            req.params[field] = formattedDate.format("YYYY-MM-DD");
        }
      }
    }
    next();
  };
};

module.exports = formatDateMiddleware;
