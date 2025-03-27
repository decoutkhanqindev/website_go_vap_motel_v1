const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const env = process.env;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "User is not authenticated. Token missing."));
  }

  // Xác minh token
  jwt.verify(token, env.JWT_ACCESS_KEY, (error, decodedPayload) => {
    if (error) {
      let message = "Token verification failed.";
      let statusCode = 403;
      if (error.name === "TokenExpiredError") {
        message = "Access token expired.";
        statusCode = 401;
      } else if (error.name === "JsonWebTokenError") {
        message = "Invalid token.";
        statusCode = 401;
      }
      // Sử dụng statusCode phù hợp
      return next(new ApiError(statusCode, message));
    }

    // Token hợp lệ! Gắn payload vào req.user
    req.user = decodedPayload;
    next();
  });
};

const verifyIsLandlord = (req, res, next) => {
  const user = req.user; // Lấy user đã được verifyToken gắn vào

  // Kiểm tra xem verifyToken có hoạt động không
  if (!user || typeof user !== "object") {
    // Lỗi nghiêm trọng, có thể là 500 hoặc 501 Not Implemented
    return next(
      new ApiError(
        500,
        "Internal server error: Authentication data processing failed."
      )
    );
  }

  // Kiểm tra quyền
  if (user.role !== "landlord") {
    return next(
      new ApiError(403, "Access denied. Landlord privileges required.")
    );
  }

  next();
};

module.exports = {
  verifyToken,
  verifyIsLandlord
};
