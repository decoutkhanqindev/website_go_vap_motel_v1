const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const UserService = require("../services/UserService");

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      logger.info(`UserController.getAllUsers() is called.`);
      const query = req.query;
      const filter = {};

      if (query.role) filter.role = query.role;
      if (query.username) filter.username = query.username;

      const users = await UserService.getAllUsers(filter);
      res.status(200).json(users);
    } catch (error) {
      logger.error(`UserController.getAllUsers() have error:\n${error}`);
      next(error);
    }
  }

  static async getUserByUsername(req, res, next) {
    try {
      logger.info(`UserController.getUserByUsername() is called.`);
      const username = req.params.username;
      if (!username)
        return next(new ApiError(400, "Param username must be provided."));

      const user = await UserService.getUserByUsername(username);
      res.status(200).json(user);
    } catch (error) {
      logger.error(`UserController.getUserByUsername() have error:\n${error}`);
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      logger.info(`UserController.getUserById() is called.`);
      const id = req.params.id;
      if (!id)
        return next(new ApiError(400, "Param username must be provided."));

      const user = await UserService.getUserById(id);
      res.status(200).json(user);
    } catch (error) {
      logger.error(`UserController.getUserById() have error:\n${error}`);
      next(error);
    }
  }

  static async addNewUser(req, res, next) {
    try {
      logger.info(`UserController.addNewUser() is called.`);
      const data = req.body;
      if (!data.role || !data.username || !data.password || !data.phone)
        return next(new ApiError(400, "No form data found."));

      const addedUser = await UserService.addNewUser(data);
      res.status(201).json(addedUser);
    } catch (error) {
      logger.error(`UserController.addNewUser() have error:\n${error}`);
      next(error);
    }
  }

  static async updateUserPhone(req, res, next) {
    try {
      logger.info(`UserController.updateUserPhone() is called.`);
      const id = req.params.id;
      const newPhone = req.body.phone;

      if (!id) return next(new ApiError(400, "Param id must be provided."));
      if (!newPhone)
        return next(new ApiError(400, "New phone must be provided."));

      const updatedUser = await UserService.updateUserPhone(id, newPhone);
      res.status(200).json(updatedUser);
    } catch (error) {
      logger.error(`UserController.updateUserPhone() have error:\n${error}`);
      next(error);
    }
  }

  static async updateUserPassword(req, res, next) {
    try {
      logger.info(`UserController.updateUserPassword() is called.`);
      const id = req.params.id;
      const newPassword = req.body.password;

      if (!id) return next(new ApiError(400, "Param id must be provided."));
      if (!newPassword)
        return next(new ApiError(400, "New password must be provided."));

      const updatedUser = await UserService.updateUserPassword(id, newPassword);
      res.status(200).json(updatedUser);
    } catch (error) {
      logger.error(`UserController.updateUserPassword() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      logger.info(`UserController.deleteUser() is called.`);
      const id = req.params.id;
      if (!id) return next(new ApiError(400, "Param id must be provided."));

      const deletedUser = await UserService.deleteUser(id);
      res.status(200).json(deletedUser);
    } catch (error) {
      logger.error(`UserController.deleteUser() have error:\n${error}`);
      next(error);
    }
  }

  static async authenticateUser(req, res, next) {
    try {
      logger.info(`UserController.authenticateUser() is called.`);
      const { username, password } = req.body;
      if (!username || !password)
        return next(
          new ApiError(400, "Username and password must be provided.")
        );

      const authenticatedUser = await UserService.authenticateUser(
        username,
        password
      );

      res.cookie("refreshToken", authenticatedUser.refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict"
      });

      res.status(200).json(authenticatedUser);
    } catch (error) {
      logger.error(`UserController.authenticateUser() have error:\n${error}`);
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      logger.info(`UserController.refreshToken() is called.`);
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken)
        return next(new ApiError(401, "User is not authencated."));

      // create new access token and refresh token
      const { newAccessToken, newRefreshToken } =
        await UserService.refreshToken(refreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict"
      });

      res.status(200).json({ newAccessToken: newAccessToken });
    } catch (error) {
      logger.error(`UserController.refreshToken() have error:\n${error}`);
      next(error);
    }
  }

  static async logoutUser(req, res, next) {
    try {
      logger.info(`UserController.logoutUser() is called.`);
      const refreshToken = req.cookies.refreshToken;
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict"
      });
      if (!refreshToken)
        return next(new ApiError(401, "User is not authencated."));

      const deletedRefreshToken = await UserService.logoutUser(refreshToken);
      res.status(200).json(deletedRefreshToken);
    } catch (error) {
      logger.error(
        `UserSerUserControllervice.logoutUser() have error:\n${error}`
      );
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      logger.info(`UserController.getMe() is called.`);
      const userId = req.user.id;
      const user = await UserService.getMe(userId);
      const { password, ...userData } = user.toObject ? user.toObject() : user;
      res.status(200).json(userData);
    } catch (error) {
      logger.error(`UserController.getMe() have error:\n${error}`);
      next(error);
    }
  }
}

module.exports = UserController;
