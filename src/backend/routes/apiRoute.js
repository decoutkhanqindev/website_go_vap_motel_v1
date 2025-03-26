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
const { User } = require("../models/User");

// amenity routes
router.get("/amenities", AmenityController.getAllAmenities);
router.get("/amenity/:id", AmenityController.getAmenityById);
router.get("/amenity/image/:id", AmenityController.getAmenityImageById);
router.post(
  "/amenity",
  verifyIsLandlord,
  upload.array("images", 5),
  AmenityController.addNewAmenity
);
router.put("/amenity/:id", verifyIsLandlord, AmenityController.updateAmenity);
router.delete(
  "/amenity/:id",
  verifyIsLandlord,
  AmenityController.deleteAmenity
);
router.patch(
  "/amenity/:id/images",
  verifyIsLandlord,
  upload.array("images", 5),
  AmenityController.addImagesToAmenity
);
router.delete(
  "/amenity/:id/images",
  verifyIsLandlord,
  AmenityController.deleteImagesForAmenity
);

// ___________________________________________________________________________________________________
// utility routes
router.get("/utilities", UtilityController.getAllUtilities);
router.get("/utility/:id", UtilityController.getUtilityById);
router.get("/utility/image/:id", UtilityController.getUtilityImageById);
router.post(
  "/utility",
  verifyIsLandlord,
  upload.array("images", 5),
  UtilityController.addNewUtility
);
router.put("/utility/:id", verifyIsLandlord, UtilityController.updateUtility);
router.delete(
  "/utility/:id",
  verifyIsLandlord,
  UtilityController.deleteUtility
);
router.patch(
  "/utility/:id/images",
  verifyIsLandlord,
  upload.array("images", 5),
  UtilityController.addImagesToUtility
);
router.delete(
  "/utility/:id/images",
  verifyIsLandlord,
  UtilityController.deleteImagesForUtility
);

// ___________________________________________________________________________________________________
// room routes
router.get("/rooms", RoomController.getAllRooms);
router.get("/room/:id", RoomController.getRoomById);
router.get("/room/image/:id", RoomController.getRoomImageById);
router.post(
  "/room",
  verifyIsLandlord,
  upload.array("images", 5),
  RoomController.addNewRoom
);
router.put("/room/:id", verifyIsLandlord, RoomController.updateRoom);
router.delete("/room/:id", verifyIsLandlord, RoomController.deleteRoom);
router.patch(
  "/room/:id/images",
  verifyIsLandlord,
  upload.array("images", 5),
  RoomController.addImagesToRoom
);
router.delete(
  "/room/:id/images",
  verifyIsLandlord,
  RoomController.deleteImagesForRoom
);
router.patch(
  "/room/:id/amenities",
  verifyIsLandlord,
  RoomController.addAmenitiesToRoom
);
router.delete(
  "/room/:id/amenities",
  verifyIsLandlord,
  RoomController.deleteAmenitiesForRoom
);
router.patch(
  "/room/:id/utilities",
  verifyIsLandlord,
  RoomController.addUtilitiesToRoom
);
router.delete(
  "/room/:id/utilities",
  verifyIsLandlord,
  RoomController.deleteUtilitiesForRoom
);

// ___________________________________________________________________________________________________
// occupant routes
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
router.delete(
  "/occupant/:id",
  verifyIsLandlord,
  OccupantController.deleteOccupant
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

// ___________________________________________________________________________________________________
// contract routes
router.get(
  "/contracts",
  verifyToken,
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.getAllContracts
);
router.get("/contract/:id", verifyToken, ContractController.getContractById);
router.post(
  "/contract",
  verifyIsLandlord,
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.addNewContract
);
router.put(
  "/contract/:id",
  verifyIsLandlord,
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.updateContract
);
router.delete(
  "/contract/:id",
  verifyIsLandlord,
  ContractController.deleteContract
);
router.patch(
  "/contract/:id/extend",
  verifyIsLandlord,
  formatDateMiddleware(["endDate"]),
  ContractController.extendContract
);
router.patch(
  "/contract/:id/terminate",
  verifyIsLandlord,
  ContractController.terminateContract
);

// ___________________________________________________________________________________________________
// invoice routes
router.get("/invoices", verifyToken, InvoiceController.getAllInvoices);
router.get("/invoice/:id", verifyToken, InvoiceController.getInvoiceById);
router.post("/invoice", verifyIsLandlord, InvoiceController.addNewInvoice);
router.put("/invoice/:id", verifyIsLandlord, InvoiceController.updateInvoice);
router.delete(
  "/invoice/:id",
  verifyIsLandlord,
  InvoiceController.deleteInvoice
);
router.patch(
  "/invoice/:id",
  verifyIsLandlord,
  InvoiceController.markInvoiceIsPaid
);

// ___________________________________________________________________________________________________
// expense routes
router.get("/expenses", verifyToken, ExpenseController.getAllExpenses);
router.get("/expense/:id", verifyToken, ExpenseController.getExpenseById);
router.get(
  "/expense/receiptImage/:id",
  verifyToken,
  ExpenseController.getExpenseReceiptImageById
);
router.post(
  "/expense",
  verifyIsLandlord,
  formatDateMiddleware(["expenseDate"]),
  upload.array("receiptImages", 5),
  ExpenseController.addNewExpense
);
router.put(
  "/expense/:id",
  verifyIsLandlord,
  formatDateMiddleware(["expenseDate"]),
  ExpenseController.updateExpense
);
router.delete(
  "/expense/:id",
  verifyIsLandlord,
  ExpenseController.deleteExpense
);
router.patch(
  "/expense/:id/receiptImages",
  verifyIsLandlord,
  upload.array("receiptImages", 5),
  ExpenseController.addReceiptImagesToExpense
);
router.delete(
  "/expense/:id/receiptImages",
  verifyIsLandlord,
  ExpenseController.deleteReceiptImagesForExpense
);

// ___________________________________________________________________________________________________
// repair request routes
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
router.delete(
  "/repairRequest/:id",
  verifyIsLandlord,
  RepairRequestController.deleteRepairRequest
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

// ___________________________________________________________________________________________________
// user routes
router.post("/user/authenticate", UserController.authenticateUser);
router.post("/user/refreshToken", UserController.refreshToken);
router.post("/user/logout", UserController.logoutUser);
router.post("/user", verifyIsLandlord, UserController.addNewUser);
router.get("/users", verifyIsLandlord, UserController.getAllUsers);
router.get("/user/:username", verifyToken, UserController.getUserByUsername);
router.get("/user/current/me", verifyToken, UserController.getMe);
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
router.delete("/user/:username", verifyIsLandlord, UserController.deleteUser);

module.exports = router;
