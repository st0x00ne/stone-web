const express = require("express");

const router = express.Router();

//Display Dashboard
router.get("/", (req, res) => {
    res.render("dashboard");
});

module.exports = router;