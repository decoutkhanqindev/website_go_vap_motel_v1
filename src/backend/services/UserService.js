require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = process.env;
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const { User, RefreshToken } = require("../models/User");

class UserService {
  static async getAllUsers(filter = {}) {
    try {
      logger.info(`UserService.getAllUsers() is called.`);
      let query = User.find();
      if (filter.role) query = query.where("role").equals(filter.role);

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
    // New method to get user by ID
    try {
      logger.info(`UserService.getUserById() is called with ID: ${id}`);
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

  static async updateUserPhone(username, phone) {
    try {
      logger.info(`UserService.updateUser() is called.`);
      const updatedUser = await User.findOneAndUpdate(
        { username: username },
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

  static async updateUserPassword(username, newPassword) {
    try {
      logger.info(`UserService.updateUserPassword() is called.`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await User.findOneAndUpdate(
        { username: username },
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

  static async deleteUser(username) {
    try {
      logger.info(`UserService.deleteUser() is called.`);
      const deletedUser = await User.findOneAndDelete({ username: username });
      if (!deletedUser) {
        throw new ApiError(404, `No user found matching username ${username}.`);
      }
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
        throw new ApiError(401, "Invalid password.");
      }

      const accessToken = UserService.generateToken(
        user,
        env.JWT_ACCESS_KEY,
        "5m"
      );
      const refreshToken = UserService.generateToken(
        user,
        env.JWT_REFRESH_KEY,
        "15m"
      );

      return { user, accessToken, refreshToken };
    } catch (error) {
      logger.error(`UserService.authenticateUser() have error:\n${error}`);
      throw error;
    }
  }

  static async refreshToken(refreshToken) {
    try {
      logger.info(`UserService.refreshToken() is called.`);
      let newAccessToken;
      let newRefreshToken;

      jwt.verify(refreshToken, env.JWT_REFRESH_KEY, (error, user) => {
        if (error) throw new ApiError(403, "Token is not valid.");
        newAccessToken = UserService.generateToken(
          user,
          env.JWT_ACCESS_KEY,
          "30s"
        );
        newRefreshToken = UserService.generateToken(
          user,
          env.JWT_REFRESH_KEY,
          "30s"
        );
      });

      const newRefreshTokenModel = new RefreshToken({ data: newRefreshToken });
      await newRefreshTokenModel.save();

      return { newAccessToken, newRefreshToken };
    } catch (error) {
      logger.error(`UserService.refreshToken() have error:\n${error}`);
      throw error;
    }
  }

  static async logoutUser(refreshToken) {
    try {
      logger.info(`UserService.logoutUser() is called.`);
      const deletedRefreshToken = await RefreshToken.findOneAndDelete({
        data: refreshToken
      });
      if (!deletedRefreshToken)
        throw new ApiError(401, "Not found refresh token.");
      return deletedRefreshToken;
    } catch (error) {
      logger.error(`UserService.logoutUser() have error:\n${error}`);
      throw error;
    }
  }
  static async getMe(userId) {
    // New method to get the current user
    try {
      logger.info(`UserService.getMe() is called`);
      const user = await UserService.getUserById(userId); // Use existing getUserById
      return user;
    } catch (error) {
      logger.error(`UserService.getMe() have error:\n${error}`);
      throw error;
    }
  }
}

module.exports = UserService;
