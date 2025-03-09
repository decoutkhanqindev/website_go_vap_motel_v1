const moment = require("moment-timezone");

const formatDateMiddleware = (fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      const dateValue =
        req.params[field] || req.query[field] || req.body[field];

      if (dateValue) {
        const formattedDate = moment(dateValue, "DD/MM/YYYY", true);
        if (formattedDate.isValid()) {
          if (req.body[field]) req.body[field] = formattedDate.toDate();
          if (req.query[field]) req.query[field] = formattedDate.format(); 
          if (req.params[field]) req.params[field] = dateValue;
        }
      }
    }
    next();
  };
};

module.exports = formatDateMiddleware;
