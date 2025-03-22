const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const env = process.env;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, env.JWT_ACCESS_KEY, (error, user) => {
      if (error) next(new ApiError(403, "Token is not valid"));
      req.user = user;
      next();
    });
  } else {
    next(new ApiError(401, "User is not authenticated."));
  }
};

const verifyIsLandlord = (req, res, next) => {
  verifyToken(req, res, () => {
    const user = req.user;
    if (user.role === "landlord") {
      next();
    } else {
      next(
        new ApiError(
          401,
          "User is not allowed to do this action. Only landlord."
        )
      );
    }
  });
};

module.exports = {
  verifyToken,
  verifyIsLandlord
};
