const express = require("express");
const router = express.Router();
const upload = require("../configs/uploadConfig");
const formatDateMiddleware = require("../middlewares/formatDateMiddleware");
const AmenityController = require("../controllers/AmenityController");
const UtilityController = require("../controllers/UtilityController");
const RoomController = require("../controllers/RoomController");
const OccupantController = require("../controllers/OccupantController");
const ContractController = require("../controllers/ContractController");
const InvoiceController = require("../controllers/InvoiceController");
const ExpenseController = require("../controllers/ExpenseController");
const RepairRequestController = require("../controllers/RepairRequestController");
const UserController = require("../controllers/UserController");

// amenity routes
router.get("/amenities", AmenityController.getAllAmenities);
router.get("/amenity/:id", AmenityController.getAmenityById);
router.get("/amenity/image/:id", AmenityController.getAmenityImageById);
router.patch(
  "/amenity/:id/images",
  upload.array("images", 5),
  AmenityController.addImagesToAmenity
);
router.delete("/amenity/:id/images", AmenityController.deleteImagesForAmenity);
router.post(
  "/amenity",
  upload.array("images", 5),
  AmenityController.addNewAmenity
);
router.put("/amenity/:id", AmenityController.updateAmenity);
router.delete("/amenity/:id", AmenityController.deleteAmenity);

// ___________________________________________________________________________________________________

// utility routes
router.get("/utilities", UtilityController.getAllUtilities);
router.get("/utility/:id", UtilityController.getUtilityById);
router.get("/utility/image/:id", UtilityController.getUtilityImageById);
router.patch(
  "/utility/:id/images",
  upload.array("images", 5),
  UtilityController.addImagesToUtility
);
router.delete("/utility/:id/images", UtilityController.deleteImagesForUtility);
router.post(
  "/utility",
  upload.array("images", 5),
  UtilityController.addNewUtility
);
router.put("/utility/:id", UtilityController.updateUtility);
router.delete("/utility/:id", UtilityController.deleteUtility);

// ___________________________________________________________________________________________________

// room routes
router.get("/rooms", RoomController.getAllRooms);
router.get("/room/:id", RoomController.getRoomById);
router.get("/room/image/:id", RoomController.getRoomImageById);
router.patch(
  "/room/:id/images",
  upload.array("images", 5),
  RoomController.addImagesToRoom
);
router.delete("/room/:id/images", RoomController.deleteImagesForRoom);
router.patch("/room/:id/amenities", RoomController.addAmenitiesToRoom);
router.delete("/room/:id/amenities", RoomController.deleteAmenitiesForRoom);
router.patch("/room/:id/utilities", RoomController.addUtilitiesToRoom);
router.delete("/room/:id/utilities", RoomController.deleteUtilitiesForRoom);
router.post("/room", upload.array("images", 5), RoomController.addNewRoom);
router.put("/room/:id", RoomController.updateRoom);
router.delete("/room/:id", RoomController.deleteRoom);

// ___________________________________________________________________________________________________

// occupant routes
router.get("/occupants", OccupantController.getAllOccupants);
router.get("/occupant/:id", OccupantController.getOccupantById);
router.get(
  "/occupant/cccdImage/:id",
  OccupantController.getOccupantCccdImageById
);
router.patch(
  "/occupant/:id/cccdImages",
  upload.array("cccdImages", 5),
  OccupantController.addCccdImagesToOccupant
);
router.delete(
  "/occupant/:id/cccdImages",
  OccupantController.deleteCccdImagesForOccupant
);
router.post(
  "/occupant",
  formatDateMiddleware(["birthday"]),
  upload.array("cccdImages", 5),
  OccupantController.addNewOccupant
);
router.put(
  "/occupant/:id",
  formatDateMiddleware(["birthday"]),
  OccupantController.updateOccupant
);
router.delete("/occupant/:id", OccupantController.deleteOccupant);

// ___________________________________________________________________________________________________

// contract routes
router.get(
  "/contracts",
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.getAllContracts
);
router.get("/contract/:id", ContractController.getContractById);
router.post(
  "/contract",
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.addNewContract
);
router.put(
  "/contract/:id",
  formatDateMiddleware(["startDate", "endDate"]),
  ContractController.updateContract
);
router.delete("/contract/:id", ContractController.deleteContract);
router.patch(
  "/contract/:id/extend",
  formatDateMiddleware(["endDate"]),
  ContractController.extendContract
);
router.patch("/contract/:id/terminate", ContractController.terminateContract);

// ___________________________________________________________________________________________________

// invoice routes
router.get("/invoices", InvoiceController.getAllInvoices);
router.get("/invoice/:id", InvoiceController.getInvoiceById);
router.post("/invoice", InvoiceController.addNewInvoice);
router.put("/invoice/:id", InvoiceController.updateInvoice);
router.delete("/invoice/:id", InvoiceController.deleteInvoice);
router.patch("/invoice/:id", InvoiceController.markInvoiceIsPaid);

// ___________________________________________________________________________________________________

// expense routes
router.get("/expenses", ExpenseController.getAllExpenses);
router.get("/expense/:id", ExpenseController.getExpenseById);
router.get(
  "/expense/receiptImage/:id",
  ExpenseController.getExpenseReceiptImageById
);
router.patch(
  "/expense/:id/receiptImages",
  upload.array("receiptImages", 5),
  ExpenseController.addReceiptImagesToExpense
);
router.delete(
  "/expense/:id/receiptImages",
  ExpenseController.deleteReceiptImagesForExpense
);
router.post(
  "/expense",
  formatDateMiddleware(["expenseDate"]),
  upload.array("receiptImages", 5),
  ExpenseController.addNewExpense
);
router.put(
  "/expense/:id",
  formatDateMiddleware(["expenseDate"]),
  ExpenseController.updateExpense
);
router.delete("/expense/:id", ExpenseController.deleteExpense);

// ___________________________________________________________________________________________________

// repair request routes
router.get("/repairRequests", RepairRequestController.getAllRepairRequests);
router.get("/repairRequest/:id", RepairRequestController.getRepairRequestById);
router.get(
  "/repairRequest/image/:id",
  RepairRequestController.getRepairRequestImageById
);
router.patch(
  "/repairRequest/:id/images",
  upload.array("images", 5),
  RepairRequestController.addImagesToRepairRequest
);
router.delete(
  "/repairRequest/:id/images",
  RepairRequestController.deleteImagesForRepairRequest
);
router.post(
  "/repairRequest",
  formatDateMiddleware(["requestDate"]),
  upload.array("images", 5),
  RepairRequestController.addNewRepairRequest
);
router.put(
  "/repairRequest/:id",
  formatDateMiddleware(["requestDate"]),
  RepairRequestController.updateRepairRequest
);
router.delete(
  "/repairRequest/:id",
  RepairRequestController.deleteRepairRequest
);

// ___________________________________________________________________________________________________

// user routes
router.post("/user/authenticate", UserController.authenticateUser);
router.get("/users", UserController.getAllUsers);
router.get("/user/:username", UserController.getUserByUsername);
router.post("/user", UserController.addNewUser);
router.patch("/user/:username/phone", UserController.updateUserPhone);
router.patch("/user/:username/password", UserController.updateUserPassword);
router.delete("/user/:username", UserController.deleteUser);

module.exports = router;
