const express = require("express");
const router = express.Router();
const upload = require("../configs/uploadConfig");
const formatDateMiddleware = require("../middlewares/formatDateMiddleware");
const {
  verifyToken,
  verifyIsLandlord
} = require("../middlewares/authMiddleware");
const AmenityController = require("../controllers/AmenityController");
const UtilityController = require("../controllers/UtilityController");
const RoomController = require("../controllers/RoomController");
const OccupantController = require("../controllers/OccupantController");
const ContractController = require("../controllers/ContractController");
const InvoiceController = require("../controllers/InvoiceController");
const ExpenseController = require("../controllers/ExpenseController");
const RepairRequestController = require("../controllers/RepairRequestController");
const UserController = require("../controllers/UserController");

// =======================================
// amenity routes
// =======================================
// Public routes
router.get("/amenities", AmenityController.getAllAmenities);
router.get("/amenity/:id", AmenityController.getAmenityById);
router.get("/amenity/image/:id", AmenityController.getAmenityImageById);

// Landlord only routes
router.post(
  "/amenity",
  verifyToken,
  verifyIsLandlord,
  upload.array("images", 5),
  AmenityController.addNewAmenity
);
router.put(
  "/amenity/:id",
  verifyToken,
  verifyIsLandlord,
  AmenityController.updateAmenity
);
router.delete(
  "/amenity/:id",
  verifyToken,
  verifyIsLandlord,
  AmenityController.deleteAmenity
);
router.patch(
  "/amenity/:id/images",
  verifyToken,
  verifyIsLandlord,
  upload.array("images", 5),
  AmenityController.addImagesToAmenity
);
router.delete(
  "/amenity/:id/images",
  verifyToken,
  verifyIsLandlord,
  AmenityController.deleteImagesForAmenity
);

// =======================================
// utility routes
// =======================================
// Public routes
router.get("/utilities", UtilityController.getAllUtilities);
router.get("/utility/:id", UtilityController.getUtilityById);
router.get("/utility/image/:id", UtilityController.getUtilityImageById);

// Landlord only routes
router.post(
  "/utility",
  verifyToken,
  verifyIsLandlord,
  upload.array("images", 5),
  UtilityController.addNewUtility
);
router.put(
  "/utility/:id",
  verifyToken,
  verifyIsLandlord,
  UtilityController.updateUtility
);
router.delete(
  "/utility/:id",
  verifyToken,
  verifyIsLandlord,
  UtilityController.deleteUtility
);
router.patch(
  "/utility/:id/images",
  verifyToken,
  verifyIsLandlord,
  upload.array("images", 5),
  UtilityController.addImagesToUtility
);
router.delete(
  "/utility/:id/images",
  verifyToken,
  verifyIsLandlord,
  UtilityController.deleteImagesForUtility
);

// =======================================
// room routes
// =======================================
// Public routes
router.get("/rooms", RoomController.getAllRooms);
router.get("/room/:id", RoomController.getRoomById);
router.get("/room/image/:id", RoomController.getRoomImageById);

// Landlord only routes
router.post(
  "/room",
  verifyToken,
  verifyIsLandlord,
  upload.array("images", 5),
  RoomController.addNewRoom
);
router.put(
  "/room/:id",
  verifyToken,
  verifyIsLandlord,
  RoomController.updateRoom
);
router.delete(
  "/room/:id",
  verifyToken,
  verifyIsLandlord,
  RoomController.deleteRoom
);
router.patch(
  "/room/:id/images",
  verifyToken,
  verifyIsLandlord,
  upload.array("images", 5),
  RoomController.addImagesToRoom
);
router.delete(
  "/room/:id/images",
  verifyToken,
  verifyIsLandlord,
  RoomController.deleteImagesForRoom
);
router.patch(
  "/room/:id/amenities",
  verifyToken,
  verifyIsLandlord,
  RoomController.addAmenitiesToRoom
);
router.delete(
  "/room/:id/amenities",
  verifyToken,
  verifyIsLandlord,
  RoomController.deleteAmenitiesForRoom
);
router.patch(
  "/room/:id/utilities",
  verifyToken,
  verifyIsLandlord,
  RoomController.addUtilitiesToRoom
);
router.delete(
  "/room/:id/utilities",
  verifyToken,
  verifyIsLandlord,
  RoomController.deleteUtilitiesForRoom
);

// =======================================
// occupant routes
// =======================================
// Logged in user routes (any role)
router.get("/occupants", verifyToken, OccupantController.getAllOccupants);
router.get("/occupant/:id", verifyToken, OccupantController.getOccupantById);
router.get(
  "/occupant/cccdImage/:id",
  verifyToken,
  OccupantController.getOccupantCccdImageById
);
router.post(
  "/occupant",
  verifyToken,
  formatDateMiddleware(["birthday"]),
  upload.array("cccdImages", 5),
  OccupantController.addNewOccupant
);
router.put(
  "/occupant/:id",
  verifyToken,
  formatDateMiddleware(["birthday"]),
  OccupantController.updateOccupant
);
router.patch(
  "/occupant/:id/cccdImages",
  verifyToken,
  upload.array("cccdImages", 5),
  OccupantController.addCccdImagesToOccupant
);
router.delete(
  "/occupant/:id/cccdImages",
  verifyToken,
  OccupantController.deleteCccdImagesForOccupant
);

// Landlord only route
router.delete(
  "/occupant/:id",
  verifyToken,
  verifyIsLandlord,
  OccupantController.deleteOccupant
);

// =======================================
// contract routes
// =======================================
// Logged in user routes (any role)
router.get("/contract/:id", verifyToken, ContractController.getContractById);

// Landlord only routes
router.get(
  "/contracts",
  verifyToken,
  verifyIsLandlord,
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.getAllContracts
);
router.post(
  "/contract",
  verifyToken,
  verifyIsLandlord,
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.addNewContract
);
router.put(
  "/contract/:id",
  verifyToken,
  verifyIsLandlord,
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.updateContract
);
router.delete(
  "/contract/:id",
  verifyToken,
  verifyIsLandlord,
  ContractController.deleteContract
);
router.patch(
  "/contract/:id/extend",
  verifyToken,
  verifyIsLandlord,
  formatDateMiddleware(["endDate"]),
  ContractController.extendContract
);
router.patch(
  "/contract/:id/terminate",
  verifyToken,
  verifyIsLandlord,
  ContractController.terminateContract
);

// =======================================
// invoice routes
// =======================================
// Logged in user routes (any role)
router.get("/invoices", verifyToken, InvoiceController.getAllInvoices);
router.get("/invoice/:id", verifyToken, InvoiceController.getInvoiceById);

// Landlord only routes
router.post(
  "/invoice",
  verifyToken,
  verifyIsLandlord,
  InvoiceController.addNewInvoice
);
router.put(
  "/invoice/:id",
  verifyToken,
  verifyIsLandlord,
  InvoiceController.updateInvoice
);
router.delete(
  "/invoice/:id",
  verifyToken,
  verifyIsLandlord,
  InvoiceController.deleteInvoice
);
router.patch(
  // Mark as paid
  "/invoice/:id/paid",
  verifyToken,
  verifyIsLandlord,
  InvoiceController.markInvoiceIsPaid
);

// =======================================
// expense routes
// =======================================
// Logged in user routes (any role)
router.get("/expenses", verifyToken, ExpenseController.getAllExpenses);
router.get("/expense/:id", verifyToken, ExpenseController.getExpenseById);
router.get(
  "/expense/receiptImage/:id",
  verifyToken,
  ExpenseController.getExpenseReceiptImageById
);

// Landlord only routes
router.post(
  "/expense",
  verifyToken,
  verifyIsLandlord,
  formatDateMiddleware(["expenseDate"]),
  upload.array("receiptImages", 5),
  ExpenseController.addNewExpense
);
router.put(
  "/expense/:id",
  verifyToken,
  verifyIsLandlord,
  formatDateMiddleware(["expenseDate"]),
  ExpenseController.updateExpense
);
router.delete(
  "/expense/:id",
  verifyToken,
  verifyIsLandlord,
  ExpenseController.deleteExpense
);
router.patch(
  "/expense/:id/receiptImages",
  verifyToken,
  verifyIsLandlord,
  upload.array("receiptImages", 5),
  ExpenseController.addReceiptImagesToExpense
);
router.delete(
  "/expense/:id/receiptImages",
  verifyToken,
  verifyIsLandlord,
  ExpenseController.deleteReceiptImagesForExpense
);

// =======================================
// repair request routes
// =======================================
// Logged in user routes (any role)
router.get(
  "/repairRequests",
  verifyToken,
  RepairRequestController.getAllRepairRequests
);
router.get(
  "/repairRequest/:id",
  verifyToken,
  RepairRequestController.getRepairRequestById
);
router.get(
  "/repairRequest/image/:id",
  verifyToken,
  RepairRequestController.getRepairRequestImageById
);
router.post(
  "/repairRequest",
  verifyToken,
  formatDateMiddleware(["requestDate"]),
  upload.array("images", 5),
  RepairRequestController.addNewRepairRequest
);
router.put(
  "/repairRequest/:id",
  verifyToken,
  formatDateMiddleware(["requestDate"]),
  RepairRequestController.updateRepairRequest
);
router.patch(
  "/repairRequest/:id/images",
  verifyToken,
  upload.array("images", 5),
  RepairRequestController.addImagesToRepairRequest
);
router.delete(
  "/repairRequest/:id/images",
  verifyToken,
  RepairRequestController.deleteImagesForRepairRequest
);

// Landlord only route
router.delete(
  "/repairRequest/:id",
  verifyToken,
  verifyIsLandlord,
  RepairRequestController.deleteRepairRequest
);

// =======================================
// user routes
// =======================================
// Public routes
router.post("/user/authenticate", UserController.authenticateUser);
router.post("/user/refreshToken", UserController.refreshToken);
router.post("/user/logout", UserController.logoutUser);

// Landlord only routes
router.post(
  "/user", // Add new user
  verifyToken,
  verifyIsLandlord,
  UserController.addNewUser
);
router.get(
  "/users", // Get all users
  verifyToken,
  verifyIsLandlord,
  UserController.getAllUsers
);
router.delete(
  "/user/:username", // Delete user
  verifyToken,
  verifyIsLandlord,
  UserController.deleteUser
);

// Logged in user routes (any role, usually for 'self' actions)
router.get("/user/current/me", verifyToken, UserController.getMe);
router.get("/user/:username", verifyToken, UserController.getUserByUsername);

// Logged in user routes (Self or Landlord? Check controller logic)
router.patch(
  "/user/:username/phone",
  verifyToken,
  UserController.updateUserPhone
);
router.patch(
  "/user/:username/password",
  verifyToken,
  UserController.updateUserPassword
);

module.exports = router;
