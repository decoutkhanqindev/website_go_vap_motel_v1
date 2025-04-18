const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/html/home.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/html/login.html"));
});

router.get("/admin/dashboard", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/dashboard.html")
  );
});

router.get("/admin/room/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/roomDetails.html")
  );
});

router.get("/admin/amenity/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/amenityDetails.html")
  );
});

router.get("/admin/utility/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/utilityDetails.html")
  );
});

router.get("/admin/contract/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/contractDetails.html")
  );
});

router.get("/admin/invoice/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/invoiceDetails.html")
  );
});

router.get("/admin/expense/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/expenseDetails.html")
  );
});

router.get("/admin/user/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/userDetails.html")
  );
});

router.get("/admin/occupant/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/occupantDetails.html")
  );
});

router.get("/client/dashboard", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/client/dashboard.html")
  );
});

router.get("/client/room/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/client/roomDetails.html")
  );
});

router.get("/client/invoice/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/client/invoiceDetails.html")
  );
});

module.exports = router;
