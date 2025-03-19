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
      const username = req.params.username;
      const newPhone = req.body.phone;

      if (!username)
        return next(new ApiError(400, "Param username must be provided."));
      if (!newPhone)
        return next(new ApiError(400, "New phone must be provided."));

      const updatedUser = await UserService.updateUserPhone(username, newPhone);
      res.status(200).json(updatedUser);
    } catch (error) {
      logger.error(`UserController.updateUserPhone() have error:\n${error}`);
      next(error);
    }
  }

  static async updateUserPassword(req, res, next) {
    try {
      logger.info(`UserController.updateUserPassword() is called.`);
      const username = req.params.username;
      const newPassword = req.body.password;

      if (!username)
        return next(new ApiError(400, "Param username must be provided."));
      if (!newPassword)
        return next(new ApiError(400, "New password must be provided."));

      const updatedUser = await UserService.updateUserPassword(
        username,
        newPassword
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      logger.error(`UserController.updateUserPassword() have error:\n${error}`);
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      logger.info(`UserController.deleteUser() is called.`);
      const username = req.params.username;
      if (!username)
        return next(new ApiError(400, "Param username must be provided."));

      const deletedUser = await UserService.deleteUser(username);
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
      res.status(200).json(authenticatedUser);
    } catch (error) {
      logger.error(`UserController.authenticateUser() have error:\n${error}`);
      next(error);
    }
  }
}

module.exports = UserController;
