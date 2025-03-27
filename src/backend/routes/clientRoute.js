const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/html/home.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/html/login.html"));
});

router.get("/admin/dashboard",  (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/admin/dashboard.html")
  );
});

router.get("/client/dashboard", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/client/dashboard.html")
  );
});

router.get("/room/details/:id", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/html/details/roomDetails.html")
  );
});

module.exports = router;
