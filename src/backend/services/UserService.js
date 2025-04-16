require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = process.env;
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const { User, RefreshToken } = require("../models/User");
const OccupantService = require("../services/OccupantService");

class UserService {
  static async getAllUsers(filter = {}) {
    try {
      logger.info(`UserService.getAllUsers() is called.`);
      let query = User.find();

      if (filter.role) query = query.where("role").equals(filter.role);
      if (filter.username)
        query = query.where("username").equals(filter.username);

      const users = await query;
      if (!users.length)
        throw new ApiError(404, "No users found matching filter.");
      return users;
    } catch (error) {
      logger.error(`UserService.getAllUsers() have error:\n${error}`);
      throw error;
    }
  }

  static async getUserByUsername(username) {
    try {
      logger.info(`UserService.getUserByUsername() is called.`);
      const user = await User.findOne({ username: username });
      if (!user) {
        throw new ApiError(404, `No user found matching username ${username}.`);
      }
      return user;
    } catch (error) {
      logger.error(`UserService.getUserByUsername() have error:\n${error}`);
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      logger.info(`UserService.getUserById() is called.`);
      const user = await User.findById(id);
      if (!user) {
        throw new ApiError(404, `No user found matching ID ${id}.`);
      }
      return user;
    } catch (error) {
      logger.error(`UserService.getUserById() have error:\n${error}`);
      throw error;
    }
  }

  static async isExists(filter) {
    try {
      logger.info(`UserService.isExists() is called.`);
      const user = await User.findOne({
        [Object.keys(filter)[0]]: Object.values(filter)[0]
      });
      return !!user;
    } catch (error) {
      logger.error(`UserService.isExists() have error:\n${error}`);
      throw error;
    }
  }

  static async addNewUser(data) {
    try {
      logger.info(`UserService.addNewUser() is called.`);
      const { username, password, phone } = data;

      const isExistsUsername = await UserService.isExists({ username });
      if (isExistsUsername)
        throw new ApiError(409, "This username already exists.");

      const isExistsPhone = await UserService.isExists({ phone });
      if (isExistsPhone)
        throw new ApiError(409, "This phone number already exists.");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      data.password = hashedPassword;

      const newUser = new User(data);
      const addedUser = await newUser.save();
      return addedUser;
    } catch (error) {
      logger.error(`UserService.addNewUser() have error:\n${error}`);
      throw error;
    }
  }

  static async updateUserPhone(id, phone) {
    try {
      logger.info(`UserService.updateUser() is called.`);
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { phone: phone },
        { new: true }
      );
      if (!updatedUser) {
        throw new ApiError(404, `No user found matching username ${username}.`);
      }
      return updatedUser;
    } catch (error) {
      logger.error(`UserService.updateUser() have error:\n${error}`);
      throw error;
    }
  }

  static async updateUserPassword(id, newPassword) {
    try {
      logger.info(`UserService.updateUserPassword() is called.`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true }
      );
      if (!updatedUser) {
        throw new ApiError(404, `No user found matching username ${username}.`);
      }
      return updatedUser;
    } catch (error) {
      logger.error(`UserService.updateUserPassword() have error:\n${error}`);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      logger.info(`UserService.deleteUser() is called.`);
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new ApiError(404, `No user found matching id ${id}.`);
      }

      // const deletedOccupant = await OccupantService.getAllOccupants({
      //   tenantId: deletedUser._id
      // });
      // for (const occupant of deletedOccupant) {
      //   await OccupantService.deleteOccupant(occupant._id);
      // }

      return deletedUser;
    } catch (error) {
      logger.error(`UserService.deleteUser() have error:\n${error}`);
      throw error;
    }
  }

  static generateToken(user, JWT_KEY, time) {
    try {
      logger.info(`UserService.generateToken() is called.`);
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role
        },
        JWT_KEY,
        { expiresIn: time }
      );
      return token;
    } catch (error) {
      logger.error(`UserService.generateToken() have error:\n${error}`);
      throw error;
    }
  }

  static async authenticateUser(username, password) {
    try {
      logger.info(`UserService.authenticateUser() is called.`);
      const user = await UserService.getUserByUsername(username);

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logger.warn(`Invalid password attempt for user: ${username}`);
        throw new ApiError(401, "Invalid username or password.");
      }

      const accessToken = UserService.generateToken(
        user,
        env.JWT_ACCESS_KEY,
        "30m"
      );
      const refreshToken = UserService.generateToken(
        user,
        env.JWT_REFRESH_KEY,
        "1d"
      );

      // Save the new refresh token to the database
      try {
        await RefreshToken.deleteMany({ userId: user._id });
        logger.info(`Removed previous refresh tokens for user: ${username}`);

        const newRefreshTokenModel = new RefreshToken({
          data: refreshToken,
          userId: user._id
        });
        await newRefreshTokenModel.save();
        logger.info(
          `Successfully saved initial refresh token to DB for user: ${username}`
        );
      } catch (saveError) {
        logger.error(
          `CRITICAL: Failed to save initial refresh token for user ${username}: ${saveError}`
        );
        throw new ApiError(
          500,
          "Authentication failed due to server error during session creation."
        );
      }

      return { user, accessToken, refreshToken };
    } catch (error) {
      logger.error(`UserService.authenticateUser() have error:\n${error}`);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        "Authentication failed due to an unexpected server error."
      );
    }
  }

  static async refreshToken(refreshTokenFromCookie) {
    try {
      logger.info(`UserService.refreshToken() is called.`);

      let decodedPayload;
      try {
        decodedPayload = jwt.verify(
          refreshTokenFromCookie,
          env.JWT_REFRESH_KEY
        );
        logger.info(
          `Refresh token successfully verified for user ID: ${decodedPayload.id}`
        );
      } catch (verifyError) {
        logger.error(
          `Refresh token verification failed: ${verifyError.message}`
        );
        try {
          // Attempt delete by token string if verification fails
          await RefreshToken.deleteOne({ data: refreshTokenFromCookie });
          logger.info(
            `Attempted removal of invalid/expired refresh token from DB.`
          );
        } catch (deleteErr) {
          logger.error(
            `Error trying to remove invalid refresh token from DB: ${deleteErr}`
          );
        }
        throw new ApiError(403, "Refresh token is not valid or expired.");
      }

      const tokenInDb = await RefreshToken.findOne({
        data: refreshTokenFromCookie,
        userId: decodedPayload.id
      });
      if (!tokenInDb) {
        // This can happen if the token was deleted (logout) OR if a valid token from *another* user is somehow presented
        logger.warn(
          `Refresh token verified but not found in DB for user ${decodedPayload.id} (or token mismatch). Denying refresh.`
        );
        throw new ApiError(
          403,
          "Refresh token not valid (session ended or invalid)."
        );
      }

      try {
        // Deleting by the 'data' field is safer and more specific
        await RefreshToken.deleteOne({ data: refreshTokenFromCookie });
        logger.info(
          `Successfully invalidated used refresh token in DB (user: ${decodedPayload.id}).`
        );
      } catch (deleteError) {
        logger.error(
          `Error deleting old refresh token from DB: ${deleteError}`
        );
        throw new ApiError(500, "Could not invalidate old session token.");
      }

      // Generate NEW tokens
      const userPayload = { _id: decodedPayload.id, role: decodedPayload.role };
      const newAccessToken = UserService.generateToken(
        userPayload,
        env.JWT_ACCESS_KEY,
        "30m"
      );
      const newRefreshToken = UserService.generateToken(
        userPayload,
        env.JWT_REFRESH_KEY,
        "1d"
      );

      // Store the NEW refresh token in the DB
      try {
        const newRefreshTokenModel = new RefreshToken({
          data: newRefreshToken,
          userId: decodedPayload.id
        });
        await newRefreshTokenModel.save();
        logger.info(
          `Successfully saved new refresh token to DB (user: ${decodedPayload.id}).`
        );
      } catch (saveError) {
        logger.error(
          `CRITICAL: Error saving new refresh token to DB: ${saveError}`
        );
        throw new ApiError(500, "Could not save new session token.");
      }

      return { newAccessToken, newRefreshToken };
    } catch (error) {
      logger.error(
        `UserService.refreshToken() have error:\n${error.message}`,
        error
      );
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.status || 500,
        error.message || "Failed to refresh token."
      );
    }
  }

  static async logoutUser(refreshToken) {
    try {
      logger.info(`UserService.logoutUser() is called.`);
      const deletedRefreshToken = await RefreshToken.findOneAndDelete({
        data: refreshToken
      });
      if (!deletedRefreshToken) {
        logger.warn(
          `Refresh token not found in DB during logout. It might have expired or already been removed.`
        );
      } else {
        logger.info(
          `Successfully removed refresh token from DB during logout.`
        );
      }
      return { success: true, tokenRemoved: !!deletedRefreshToken };
    } catch (error) {
      logger.error(
        `UserService.logoutUser() database operation failed: ${error}`
      );
      throw new ApiError(500, "Server error during logout process.");
    }
  }

  static async getMe(userId) {
    try {
      logger.info(`UserService.getMe() is called`);
      const user = await UserService.getUserById(userId);
      return user;
    } catch (error) {
      logger.error(`UserService.getMe() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = UserService;
